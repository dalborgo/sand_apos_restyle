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

const { utils } = require(__helpers)

const logPath = path.join(__dirname, 'files', 'migration.log')

let fileLog = ''

async function processArchive () {
  const prechecks = [], closings = [], keys = {}, paymentClosingDates = {}
  const path_ = path.join(__dirname, 'files', 'archivio_short.json')
  if (!fs.existsSync(path_)) {throw Error(path_ + ' not found!')}
  const fileStream = fs.createReadStream(path_)
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })
  let cont = 0
  for await (const line of rl) {
    const doc = JSON.parse(line)
    switch (doc.type) {
      case 'CLOSING_DAY': {
        // eslint-disable-next-line no-unused-vars
        const { _id, _meta_id, type, ...rest } = doc
        for (let payment of doc.payments) {
          if(!paymentClosingDates[payment]){
            paymentClosingDates[payment] = doc.close_date
          }
        }
        
        closings.push(rest)
        keys[doc._meta_id] = cont++
        break
      }
      case 'ARCHIVE': {
        const { payments_expanded: paymentsExpanded } = doc
        for (let paymentExpanded of paymentsExpanded) {
          if (paymentExpanded.mode === 'PRECHECK') {
            prechecks.push(paymentExpanded)
            fileLog += `\nPrecheck found in archive: ${paymentExpanded._id} in ${doc._meta_id}`
          }
        }
        break
      }
    }
  }
  return { closings, prechecks, keys, paymentClosingDates }
}

async function processMerged (closings, prechecks, closingKeys, paymentClosingDates, token) {
  const docs = [], keys = {}
  const path_ = path.join(__dirname, 'files', 'astenpos_short.json')
  if (!fs.existsSync(path_)) {throw Error(path_ + ' not found!')}
  const fileStream = fs.createReadStream(path_)
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })
  let cont = 0
  for await (const line of rl) {
    const doc = JSON.parse(line)
    if (doc._meta_id.startsWith('_sync:')) {continue}
    if (doc.type === 'CLOSING_DAY') {
      const { _meta_id, close_date, date, type, ...rest } = doc
      docs.push({
        _meta_id,
        blue: { close_date, date, ...rest },
        close_date,
        date,
        red: get(closings, closingKeys[_meta_id]),
        type,
      })
    } else if(doc.type === 'PAYMENT') {
      const newOrderId = `${doc.order}_${token}`
      doc.date_closing = doc.date_closing || paymentClosingDates[doc._meta_id]
      doc.archived = true
      docs.push({ ...doc, order: newOrderId, order_id: newOrderId })
    } else {
      docs.push(doc)
    }
    keys[doc._meta_id] = cont++
  }
  for (let precheck of prechecks) {
    const { _id, order, ...rest } = precheck
    const newOrderId = `${order}_${token}`
    rest.date_closing = rest.date_closing || paymentClosingDates[_id]
    rest.archived = true
    docs.push({ _meta_id: _id, ...rest, order: newOrderId, order_id: newOrderId })
    keys[_id] = cont++
  }
  return { docs, keys }
}

const checkString = (val, key) => val && isString(val) && key !== '_meta_id'
const checkObject = val => val && isPlainObject(val)
const checkArray = val => val && isArray(val)

function findVal (node, keys, token, keyLog, sp = '') {
  if (node['_meta_id']) {
    fileLog += `\n\n*** SEARCHING IN: ${node['_meta_id']}`
  }
  if (keyLog) {fileLog += `\n${sp.replace('  ', '')}${keyLog}`}
  if (checkArray(node)) {
    let cont = 0
    for (let arrVal of node) {
      if (checkArray(arrVal)) {
        findVal(arrVal, keys, token, `${keyLog}[${cont++}]`, sp + '  ')
      } else if (checkObject(arrVal)) {
        findVal(arrVal, keys, token, `${keyLog}[${cont++}]`, sp + '  ')
      } else if (checkString(arrVal)) {
        if (keys[arrVal]) {
          const input = `${arrVal}_${token}`
          fileLog += `\n${sp}+++ Changed key in ${keyLog}[${cont}]: ${node[cont]} with ${input}`
          node[cont++] = `${arrVal}_${token}`
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
        if (keys[val]) {
          const input = `${val}_${token}`
          fileLog += `\n${sp}+++ Changed key: ${node[key]} with ${input}`
          node[key] = input
        }
      } else if (checkArray(node[key])) {
        findVal(node[key], keys, token, `ARRAY: ${key}`, sp + '  ')
      } else if (checkObject(node[key])) {
        findVal(node[key], keys, token, `OBJECT: ${key}`, sp + '  ')
      }
    })
  }
}

function addRouters (router) {
  router.get('/routines/migration', async function (req, res) {
    log.verbose('Start script')
    const { query } = req
    utils.controlParameters(query, ['token'])
    const token = query.token
    log.hint('Running...')
    const outputPath = path.join(__dirname, 'files', 'merged.json')
    if (fs.existsSync(outputPath)) {await Q.ninvoke(fs, 'unlink', outputPath)}
    if (fs.existsSync(logPath)) {await Q.ninvoke(fs, 'unlink', logPath)}
    fileLog += `${moment().format('DD-MM-YYYY HH:mm:ss')} - token: ${token}`
    const { closings, prechecks, keys: closingKeys, paymentClosingDates } = await processArchive()
    const { docs, keys } = await processMerged(closings, prechecks, closingKeys, paymentClosingDates, token)
    
    //region ricerca chiavi negli oggetti e aggiunge `token`
    for (let doc of docs) {
      findVal(doc, keys, token)
    }
    //endregion
    //region modifica `_meta_id` e aggiunge `token`: scrive file `merged.json`
    //const file = fs.createWriteStream(outputPath, { flags: 'a' })
    let cont = 0, lines = ''
    for (let doc of docs) {
      doc['_meta_id'] = `${doc['_meta_id']}_${token}`
      doc.owner = token
      delete doc['_id']
      //file.write(JSON.stringify(doc) + (++cont < docs.length ? '\n' : ''))
      lines += JSON.stringify(doc) + (++cont < docs.length ? '\n' : '')
    }
    //file.end()
    await Q.ninvoke(fs, 'writeFile', outputPath, lines)
    await Q.ninvoke(fs, 'writeFile', logPath, fileLog)
    //endregion
    log.verbose('End script')
    log.hint('End script')
    res.send({ ok: true })
  })
}

export default {
  addRouters,
}
