import fs from 'fs'
import path from 'path'
import readline from 'readline'
import get from 'lodash/get'
import isString from 'lodash/isString'
import isPlainObject from 'lodash/isPlainObject'
import isArray from 'lodash/isArray'
import moment from 'moment'
import log from '@adapter/common/src/winston'
import Q from 'q'

const { utils, axios } = require(__helpers)

const logPath = path.join(__dirname, 'files', 'migration.log')

let fileLog = ''

// meta_id senza "_" davanti
async function processArchive (method) {
  const prechecks = [], closings = [], keys = {}, paymentClosingDates = {}
  const path_ = path.join(__dirname, 'files', 'archivio.json')
  if (!fs.existsSync(path_)) {throw Error(path_ + ' not found!')}
  const fileStream = fs.createReadStream(path_)
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })
  const closingPedix = method === 'express' ? '2' : ''
  let count = 0
  for await (const line of rl) {
    const doc = JSON.parse(line)
    switch (doc.type) {
      case `CLOSING_DAY${closingPedix}`: {
        // eslint-disable-next-line no-unused-vars
        const { _id, meta_id, type, ...rest } = doc
        for (let payment of doc.payments) {
          if (!paymentClosingDates[payment]) {
            paymentClosingDates[payment] = doc.close_date
          }
        }
        closings.push(rest)
        keys[doc.meta_id] = count++
        break
      }
      case 'ARCHIVE': {
        const { payments_expanded: paymentsExpanded } = doc
        for (let paymentExpanded of paymentsExpanded) {
          if (paymentExpanded.mode === 'PRECHECK') {
            prechecks.push(paymentExpanded)
            fileLog += `\nPrecheck found in archive: ${paymentExpanded._id} in ${doc.meta_id}`
          }
        }
        break
      }
    }
  }
  return { closings, prechecks, keys, paymentClosingDates }
}

async function processMerged (closings, prechecks, closingKeys, paymentClosingDates, token, method) {
  const docs = [], keys = {}, extra = { tables: {} }
  const path_ = path.join(__dirname, 'files', 'astenpos.json')
  if (!fs.existsSync(path_)) {throw Error(path_ + ' not found!')}
  const fileStream = fs.createReadStream(path_)
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })
  let count = 0
  for await (const line of rl) {
    const doc = JSON.parse(line)
    if (doc.meta_id.startsWith('_sync:')) {continue}
    if (doc.type === 'CLOSING_DAY') {
      const { meta_id, close_date, date, type, ...rest } = doc
      // eslint-disable-next-line camelcase
      const normMetaId = method === 'express' ? 'CLOSING_DAY2' + meta_id.replace('CLOSING_DAY', '') : meta_id
      docs.push({
        blue: { close_date, date, ...rest },
        close_date,
        // eslint-disable-next-line camelcase
        date: date || close_date,
        meta_id,
        red: get(closings, closingKeys[normMetaId]),
        type,
      })
    } else if (doc.type === 'ROOM') {
      // eslint-disable-next-line no-unused-vars
      const { tables, ...rest } = doc
      docs.push(rest)
    } else if (doc.type === 'TABLE') {
      extra.tables[doc.meta_id] = { exits: doc.exits }
      docs.push(doc)
    } else if (doc.type === 'ORDER') {
      doc.order_id = doc.meta_id
      docs.push(doc)
    } else if (doc.type === 'MACRO') {
      // eslint-disable-next-line no-unused-vars
      const { categories, ...rest } = doc
      docs.push(rest)
    } else if (doc.type === 'PAYMENT') {
      const newOrderId = `${doc.order}_${token}`
      const newIncomeId = `PAYMENT_INCOME_${doc.income}_${token}`
      doc.date_closing = doc.date_closing || paymentClosingDates[doc.meta_id]
      doc.archived = true
      docs.push({ ...doc, order: newOrderId, order_id: newOrderId, income_id: newIncomeId })
    } else {
      const typeToInclude = ['CATALOG', 'CLOSING_DAY', 'CUSTOMER', 'CUSTOMER_ADDRESS', 'DEPARTMENT', 'EXIT', 'MACRO', 'ORDER', 'PAYMENT', 'ROOM', 'TABLE', 'USER', 'USER_ROLE']
      if (doc.type === 'GENERAL_CONFIGURATION') {
        extra.coverPrice = doc.cover_price || 0
      }
      const isValid = doc.type && typeToInclude.includes(doc.type)
      isValid && docs.push(doc)
    }
    keys[doc.meta_id] = count++
  }
  for (let precheck of prechecks) {
    const { _id, order, ...rest } = precheck
    const newOrderId = `${order}_${token}`
    rest.date_closing = rest.date_closing || paymentClosingDates[_id]
    rest.archived = true
    docs.push({ meta_id: _id, ...rest, order: newOrderId, order_id: newOrderId })
    keys[_id] = count++
  }
  return { docs, keys, extra }
}

const checkString = (val, key) => val && isString(val) && key !== 'meta_id'
const checkObject = val => val && isPlainObject(val)
const checkArray = val => val && isArray(val)

function findVal (node, keys, token, keyLog, sp = '') {
  if (node['meta_id']) {
    fileLog += `\n\n*** SEARCHING IN: ${node['meta_id']}`
  }
  if (keyLog) {fileLog += `\n${sp.replace('  ', '')}${keyLog}`}
  if (checkArray(node)) {
    let count = 0
    for (let arrVal of node) {
      if (checkArray(arrVal)) {
        findVal(arrVal, keys, token, `${keyLog}[${count++}]`, sp + '  ')
      } else if (checkObject(arrVal)) {
        findVal(arrVal, keys, token, `${keyLog}[${count++}]`, sp + '  ')
      } else if (checkString(arrVal)) {
        if (keys[arrVal]) {
          const input = `${arrVal}_${token}`
          fileLog += `\n${sp}+++ Changed key in ${keyLog}[${count}]: ${node[count]} with ${input}`
          node[count++] = `${arrVal}_${token}`
        }
      }
    }
  } else {
    Object.keys(node).forEach(function (key) {
      if (checkString(node[key], key)) {
        fileLog += `\n${sp}${key}`
        const val = node[key]
        if (key === 'pruduct_custom_id') {
          node['product_custom_id'] = val
          delete node[key]
          key = 'product_custom_id'
        }
        if (key === '_rev') {
          delete node[key]
        }
        if (keys[val]) {
          const input = `${val}_${token}`
          fileLog += `\n${sp}+++ Changed key: ${node[key]} with ${input}`
          node[key] = input
        }
      } else if (checkArray(node[key])) {
        findVal(node[key], keys, token, `ARRAY: ${key}`, sp + '  ')
      } else if (checkObject(node[key])) {
        if (key === '_revisions') {
          delete node[key]
        } else {
          findVal(node[key], keys, token, `OBJECT: ${key}`, sp + '  ')
        }
      }
    })
  }
}

function addRouters (router) {
  router.get('/routines/migration', async function (req, res) {
    log.verbose('Start script merge')
    const { query } = req
    utils.checkParameters(query, ['token', 'method'])
    const { token, method } = query
    log.hint('Running...')
    const outputPath = path.join(__dirname, 'files', 'merged.json')
    if (fs.existsSync(outputPath)) {await Q.ninvoke(fs, 'unlink', outputPath)}
    if (fs.existsSync(logPath)) {await Q.ninvoke(fs, 'unlink', logPath)}
    fileLog += `${moment().format('DD-MM-YYYY HH:mm:ss')} - token: ${token}`
    const { closings, prechecks, keys: closingKeys, paymentClosingDates } = await processArchive(method)
    const { docs, keys, extra } = await processMerged(closings, prechecks, closingKeys, paymentClosingDates, token, method)
    //region ricerca chiavi negli oggetti e aggiunge `token`
    for (let doc of docs) {
      if (doc.type === 'CATALOG') {
        doc.cover_price = extra.coverPrice || 0
      }
      if (doc.type === 'ORDER') {
        const table = extra.tables[doc.table]
        if (table) {
          doc.exits = table.exits
        }
      }
      findVal(doc, keys, token)
    }
    //endregion
    //region modifica `meta_id` e aggiunge `token`: scrive file `merged.json`
    //const file = fs.createWriteStream(outputPath, { flags: 'a' })
    let count = 0, lines = ''
    for (let doc of docs) {
      doc['meta_id'] = `${doc['meta_id']}_${token}`
      doc.owner = token
      delete doc['_id']
      //file.write(JSON.stringify(doc) + (++count < docs.length ? '\n' : ''))
      lines += JSON.stringify(doc) + (++count < docs.length ? '\n' : '')
    }
    //file.end()
    await Q.ninvoke(fs, 'writeFile', outputPath, lines)
    await Q.ninvoke(fs, 'writeFile', logPath, fileLog)
    //endregion
    log.verbose('End script merge')
    log.hint('End script merge')
    res.send({ ok: true })
  })
  /**
   * method = 'express' per migrare l'express (è un parametro obbligatorio)
   */
  router.get('/routines/update', async function (req, res) {
    log.verbose('Start script upload')
    const { connClass } = req
    const path_ = path.join(__dirname, 'files', 'import.json')
    if (!fs.existsSync(path_)) {throw Error(path_ + ' not found!')}
    const fileStream = fs.createReadStream(path_)
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })
    const { astenposBucketName, sgPublic, sgPublicToken } = connClass
    let docs = [], results = [], count = 0
    for await (const line of rl) {
      const doc = JSON.parse(line)
      const { meta_id: docId, ...rest } = doc
      docs.push({ ...rest, _id: docId })
      count++
      if (count === 400) {
        const { data } = await axios.restApiInstance(sgPublic, sgPublicToken).post(`/${astenposBucketName}/_bulk_docs`, { docs })
        docs = []
        count = 0
        results.push(data)
      }
    }
    if (docs.length) {
      const { data } = await axios.restApiInstance(sgPublic, sgPublicToken).post(`/${astenposBucketName}/_bulk_docs`, { docs })
      results.push(data)
    }
    log.verbose('End script upload')
    log.hint('End script upload')
    res.send({ ok: true, results })
  })
}

export default {
  addRouters,
}
