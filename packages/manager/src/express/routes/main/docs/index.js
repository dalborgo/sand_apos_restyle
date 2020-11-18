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

function addRouters (router) {
  router.get('/docs/browser', async function (req, res) {
    const { connClass, query } = req
    const parsedOwner = utils.parseOwner(query)
    if (query.text) {
      const { startkey, limit = 40, text = '' } = query
      const cursor = startkey ? `AND META().cas < ${startkey} ${parsedOwner.queryCondition} ` : ''
      const filter = text ? `AND LOWER(META().id) LIKE '%${text.toLowerCase()}%' AND ${parsedOwner.queryCondition}` : ''
      const params = `${cursor}${filter}`.trim()
      const queryTotal = `SELECT RAW COUNT(*) total_row from ${connClass.astenposBucketName} WHERE type ${filter}`
      const queryRows = `SELECT META().id, META().cas \`key\` from ${connClass.astenposBucketName} WHERE type ${params} ORDER BY META().cas DESC LIMIT ${limit}`
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
      const { owner, ...rest } = query
      const filter = `AND ${parsedOwner.queryCondition}`
      const queryTotal = `SELECT RAW COUNT(*) total_row from ${connClass.astenposBucketName} WHERE type ${filter}`
      const params = { view: 'list_docs_all', ...rest, ...parsedOwner.limitsInView }
      const promises = [
        couchViews.execService(params, connClass.astConnection),
        couchQueries.exec(queryTotal, connClass.cluster),
      ]
      const [data, resp2] = await allSettled(promises)
      if(data.results){
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
    const parsedOwner = utils.parseOwner(query)
    if (!docId) {return res.send({ ok: false, message: 'docId undefined!' })}
    const { ok, results: data, message } = await couchQueries.exec(
      'SELECT '
      + 'meta(ast).id _id, '
      + 'meta(ast).xattrs._sync.rev _rev, '
      + 'ast.* '
      + 'FROM ' + connClass.astenposBucketName + ' ast '
      + 'USE KEYS "' + docId + '" '
      + 'WHERE '+parsedOwner.queryCondition,
      connClass.cluster
    )
    if (!ok) {
      return res.send(ok, message)
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
  router.delete('/docs/delete', async function (req, res) {
    const { connClass, body } = req
    const { docId } = body
    const { astenposBucketCollection: collection } = connClass
    const data = await collection.remove(docId)
    res.send({ ok: true, results: { docId, data } })
  })
}

export default {
  addRouters,
}
