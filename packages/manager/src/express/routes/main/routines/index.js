import fs from 'fs'
import path from 'path'
import readline from 'readline'

async function processArchive () {
  const payments = [], closings = [], keys = {}
  const fileStream = fs.createReadStream(path.join(__dirname, 'files', 'archivio_short.json'))
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  })
  let cont = 0
  for await (const line of rl) {
    const doc = JSON.parse(line)
    switch (doc.type) {
      case 'CLOSING_DAY': {
        // eslint-disable-next-line no-unused-vars
        const { _id, _meta_id, close_date, date, type, ...rest } = doc
        closings.push(rest)
        keys[doc._meta_id] = cont++
        break
      }
      case 'ARCHIVE': {
        const { payments_expanded: paymentsExpanded } = doc
        for (let paymentExpanded of paymentsExpanded) {
          if (paymentExpanded.mode === 'PRECHECK') {
            payments.push(paymentExpanded)
          }
        }
        break
      }
      default:
        return
    }
  }
  return { closings, payments, keys }
}

async function processMerged (closings, closingKeys) {
  const docs = [], keys = {}
  const fileStream = fs.createReadStream(path.join(__dirname, 'files', 'astenpos_short.json'))
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  })
  let cont = 0
  for await (const line of rl) {
    const doc = JSON.parse(line)
    if (doc._meta_id.startsWith('_sync:')) {continue}
    if (doc.type === 'CLOSING_DAY') {
      const { _meta_id, close_date, date, type, ...rest } = doc
      docs.push({
        _meta_id,
        blue: rest,
        close_date,
        date,
        red: closings[closingKeys[_meta_id]],
        type,
      })
    } else {
      docs.push(doc)
    }
    keys[doc._meta_id] = cont++
  }
  return { docs, keys }
}

function addRouters (router) {
  router.get('/routines/migration', async function (req, res) {
    const { closings, payments, keys: closingKeys } = await processArchive()
    const { docs: docsAstenpos } = await processMerged(closings, closingKeys)
    const results = [...docsAstenpos, ...payments]
    res.send({ ok: true, results })
  })
}

export default {
  addRouters,
}
