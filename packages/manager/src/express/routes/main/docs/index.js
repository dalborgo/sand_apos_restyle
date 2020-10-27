import { couchQueries, couchSwagger, couchViews } from '@adapter/io'
import Q from 'q'

async function allSettled (promises) {
  const output = []
  const results = await Q.allSettled(promises)
  results.forEach(result => {
    const { state, value } = result
    if (state === 'fulfilled') {
      output.push(value.results)
    } else {
      output.push(null)
    }
  })
  return output
}

function addRouters (router) {
  router.get('/docs/browser', async function (req, res) {
    const { connClass, query } = req
    if (query.text) {
      const { startkey, limit = 40, text = '' } = query
      const cursor = startkey ? `AND META().cas < ${startkey} ` : ''
      const filter = text ? `AND LOWER(META().id) LIKE '%${text.toLowerCase()}%'` : ''
      const params = `${cursor}${filter}`.trim()
      const queryTotal = `SELECT RAW COUNT(*) total_row from ${connClass.astenposBucketName} WHERE type ${filter}`
      const queryRows = `SELECT META().id, META().cas \`key\` from ${connClass.astenposBucketName} WHERE type ${params} ORDER BY META().cas DESC LIMIT ${limit}`
      const promises = [
        couchQueries.exec(queryRows, connClass.cluster),
        couchQueries.exec(queryTotal, connClass.cluster),
      ]
      const [resp1, resp2] = await allSettled(promises)
      const data = {
        rows: resp1 || [],
        total_rows: resp2[0],
      }
      res.send({ ok: true, results: data })
    } else {
      const params = { view: 'list_docs_all2', ...query }
      const data = await couchViews.execViewService(params, connClass.astConnection)
      res.send(data)
    }
  })
  router.get('/docs/get_by_id', async function (req, res) {
    const { connClass, query } = req
    const { docId } = query
    if (!docId) {return res.send({ ok: false, message: 'docId undefined!' })}
    const { ok, results: data, message } = await couchQueries.exec(
      'SELECT '
      + 'meta(ast).id _id, '
      + 'meta(ast).xattrs._sync.rev _rev, '
      + 'ast.* '
      + 'FROM ' + connClass.astenposBucketName + ' ast '
      + 'USE KEYS "' + docId + '"',
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
    //const data = await couchSwagger.postDbBulkDocs(docs, connClass.astConnection)
    res.send(docId)
  })
}

export default {
  addRouters,
}
