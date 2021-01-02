import { couchQueries, couchSwagger, couchViews } from '@adapter/io'
import Q from 'q'

const { utils } = require(__helpers)

async function allSettled (promises) {
  const output = []
  const results = await Q.allSettled(promises)
  results.forEach(result => {
    const { state, value } = result
    if (state === 'fulfilled') {
      output.push(value)
    } else {
      output.push(null)
    }
  })
  return output
}

const getEndkey = str => str.substring(0, str.length - 1) + String.fromCharCode(str.charCodeAt(str.length - 1) + 1)

function addRouters (router) {
  router.get('/docs/browser', async function (req, res) {
    const { connClass, query } = req
    const parsedOwner = utils.parseOwner(req)
    if (query.text) {
      const { startkey, limit = 40, text = '' } = query
      const cursor = startkey ? `AND META().cas < ${startkey} ${parsedOwner.queryCondition} ` : ''
      const filter = text ? `AND LOWER(META().id) LIKE '%${text.toLowerCase()}%' AND ${parsedOwner.queryCondition}` : ''
      const params = `${cursor}${filter}`.trim()
      const queryTotal = `SELECT RAW COUNT(*) total_row from ${connClass.astenposBucketName} WHERE type is not missing ${filter}`
      const queryRows = `SELECT META().id, META().cas \`key\` from ${connClass.astenposBucketName} WHERE type is not missing ${params} ORDER BY META().cas DESC LIMIT ${limit}`
      const promises = [
        couchQueries.exec(queryRows, connClass.cluster),
        couchQueries.exec(queryTotal, connClass.cluster),
      ]
      const [resp1, resp2] = await allSettled(promises)
      const data = {
        rows: resp1.results || [],
        total_rows: resp2.results[0],
      }
      res.send({ ok: true, results: data })
    } else {
      // eslint-disable-next-line no-unused-vars
      const { owner, startkey, ...rest } = query
      let cursor = parsedOwner.startOwner, endCursor
      if (startkey) {
        const [str, num] = startkey.split('|')
        cursor = `${str}|${parseInt(num) + 1}`
        endCursor = getEndkey(str)
      }
      endCursor = endCursor || getEndkey(cursor)
      const filter = `AND ${parsedOwner.queryCondition}`
      const queryTotal = `SELECT RAW COUNT(*) total_row from ${connClass.astenposBucketName} WHERE type is not missing ${filter}`
      const params = { view: 'list_docs_all', ...rest, startkey: `"${cursor}"`, endkey: `"${endCursor}"`}
      const promises = [
        couchViews.execService(params, connClass.astConnection),
        couchQueries.exec(queryTotal, connClass.cluster),
      ]
      const [data, resp2] = await allSettled(promises)
      if (data.results && resp2.results) {
        data.results['total_rows'] = resp2.results[0]
      }
      res.send(data)
    }
  })
  router.get('/docs/browser2', async function (req, res) {
    const { connClass } = req
    const data = await couchViews.exec(connClass.astenposBucketName, 'list_docs_all', connClass.astenposBucket)
    res.send(data)
  })
  router.get('/docs/get_by_id', async function (req, res) {
    const { connClass, query } = req
    const { docId } = query
    const parsedOwner = utils.parseOwner(req)
    if (!docId) {return res.send({ ok: false, message: 'docId undefined!' })}
    const { ok, results: data, message, err } = await couchQueries.exec(
      'SELECT '
      + 'meta(ast).id _id, '
      + 'meta(ast).xattrs._sync.rev _rev, '
      + 'ast.* '
      + 'FROM ' + connClass.astenposBucketName + ' ast '
      + 'USE KEYS "' + docId + '" '
      + 'WHERE ' + parsedOwner.queryCondition,
      connClass.cluster
    )
    if (!ok) {
      return res.send(ok, message, err)
    }
    const [results] = data
    res.send({ ok, results })
  })
  router.get('/docs/get_by_type', async function (req, res) {
    const { connClass, query } = req
    const { type } = query
    const parsedOwner = utils.parseOwner(req)
    if (!type) {return res.send({ ok: false, message: 'type undefined!' })}
    const { ok, results: data, message, err } = await couchQueries.exec(
      'SELECT '
      + 'meta(ast).id _id, '
      + 'meta(ast).xattrs._sync.rev _rev, '
      + 'ast.* '
      + 'FROM ' + connClass.astenposBucketName + ' ast '
      + 'WHERE type = "' + type + '" '
      + 'AND ' + parsedOwner.queryCondition,
      connClass.cluster
    )
    if (!ok) {
      return res.send(ok, message, err)
    }
    const [results] = data
    res.send({ ok, results })
  })
  router.post('/docs/bulk', async function (req, res) {
    const { connClass, body } = req
    const { docs } = body
    const data = await couchSwagger.postDbBulkDocs(docs, connClass.astConnection)
    res.send(data)
  })
  router.put('/docs/upsert', async function (req, res) {
    const { connClass, body } = req
    const { docId, doc, options } = body
    const { astenposBucketCollection: collection } = connClass
    const data = await collection.upsert(docId, doc, options)
    res.send({ ok: true, results: { docId, data } })
  })
  router.delete('/docs/remove', async function (req, res) {
    const { connClass, body } = req
    const { docId, options } = body
    const { astenposBucketCollection: collection } = connClass
    const data = await collection.remove(docId, options)
    res.send({ ok: true, results: { docId, data } })
  })
}

export default {
  addRouters,
}
