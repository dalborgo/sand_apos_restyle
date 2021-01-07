import fs from 'fs'
import path from 'path'
import readline from 'readline'
import get from 'lodash/get'

async function processArchive () {
  const prechecks = [], closings = [], keys = {}
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
        closings.push(rest)
        keys[doc._meta_id] = cont++
        break
      }
      case 'ARCHIVE': {
        const { payments_expanded: paymentsExpanded } = doc
        for (let paymentExpanded of paymentsExpanded) {
          if (paymentExpanded.mode === 'PRECHECK') {
            prechecks.push(paymentExpanded)
          }
        }
        break
      }
      default:
        return
    }
  }
  return { closings, prechecks, keys }
}

async function processMerged (closings, prechecks, closingKeys) {
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
    } else {
      docs.push(doc)
    }
    keys[doc._meta_id] = cont++
  }
  for (let precheck of prechecks) {
    const { _id, ...rest } = precheck
    docs.push({ _meta_id: _id, ...rest })
    keys[precheck._id] = cont++
  }
  return { docs, keys }
}

const checkString = (val, key) => val && typeof val === 'string' && key !== '_meta_id'
const checkObject = val => val && typeof val === 'object'

function findVal (object, keys, token) {
  Object.keys(object).forEach(function (key) {
    if (checkString(object[key], key)) {
      const val = object[key]
      if (keys[val]) {
        object[key] = `${val}_${token}`
      }
    } else if (object[key] && Array.isArray(object[key])) {
      let cont = 0
      for (let arrVal of object[key]) {
        if (checkObject(object[key])) {
          findVal(arrVal, keys, token)
        } else if (checkString(arrVal, key)) {
          if (keys[arrVal]) {
            object[key][cont++] = `${arrVal}_${token}`
          }
        }
      }
    } else if (checkObject(object[key])) {
      findVal(object[key], keys, token)
    }
  })
}

function addRouters (router) {
  router.get('/routines/migration', async function (req, res) {
    const token = 'prova'
    const path_ = path.join(__dirname, 'files', 'merged.json')
    if (fs.existsSync(path_)) {fs.unlinkSync(path_)}
    const { closings, prechecks, keys: closingKeys } = await processArchive()
    const { docs: docsAstenpos, keys } = await processMerged(closings, prechecks, closingKeys)
    
    //region ricerca chiavi negli oggetti e aggiunge `token`
    for (let doc of docsAstenpos) {
      findVal(doc, keys, token)
    }
    //endregion
    const file = fs.createWriteStream(path_, {
      flags: 'a',
    })
    //region modifica `_meta_id` e aggiunge `token`
    let cont = 0
    for (let doc of docsAstenpos) {
      cont++
      doc['_meta_id'] = `${doc['_meta_id']}_${token}`
      file.write(JSON.stringify(doc) + (cont < docsAstenpos.length ? '\n' : ''))
    }
    file.end()
    //endregion
    
    res.send({ ok: true, results: docsAstenpos })
  })
}

export default {
  addRouters,
}
