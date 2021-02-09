import { couchQueries, couchViews } from '@adapter/io'
import { queryById } from '../queries'

const { utils, axios } = require(__helpers)

const getEndkey = str => str.substring(0, str.length - 1) + String.fromCharCode(str.charCodeAt(str.length - 1) + 1)

function addRouters (router) {
  router.get('/docs/browser_service', async function (req, res) {
    const { connClass, query } = req
    const parsedOwner = utils.parseOwner(req)
    if (query.text) {
      const { startkey, limit = 40, text = '' } = query
      const cursor = startkey ? `AND META().cas < ${startkey} ` : ''
      const filter = `AND LOWER(META().id) LIKE '%${text.toLowerCase()}%' AND ${parsedOwner.queryCondition}`
      const params = `${cursor}${filter}`
      const queryTotal = `SELECT RAW COUNT(*) total_row from \`${connClass.astenposBucketName}\` WHERE type is not missing ${filter}`
      const queryRows = `SELECT META().id, META().cas \`key\` from \`${connClass.astenposBucketName}\` WHERE type is not missing ${params} ORDER BY META().cas DESC LIMIT ${limit}`
      const promises = [
        couchQueries.exec(queryRows, connClass.cluster),
        couchQueries.exec(queryTotal, connClass.cluster),
      ]
      const [resp1, resp2] = await utils.allSettled(promises)
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
      const queryTotal = `SELECT RAW COUNT(*) total_row from \`${connClass.astenposBucketName}\` WHERE type is not missing ${filter}`
      const protocol = connClass.serverProtocol
      const params = {
        ...rest,
        endkey: `"${endCursor}"`,
        protocol,
        startkey: `"${cursor}"`,
        view: 'list_docs_all',
      }
      const promises = [
        couchViews.execService(params, connClass.astConnection),
        couchQueries.exec(queryTotal, connClass.cluster),
      ]
      const [data, resp2] = await utils.allSettled(promises)
      if (data.results && resp2.results) {
        data.results['total_rows'] = resp2.results[0]
      }
      res.send(data)
    }
  })
  router.get('/docs/browser_sdk', async function (req, res) {
    const { connClass, query } = req
    const parsedOwner = utils.parseOwner(req)
    if (query.text) {
      const { startkey, limit = 40, text = '' } = query
      const cursor = startkey ? `AND META().cas < ${startkey} ` : ''
      const filter = `AND LOWER(META().id) LIKE '%${text.toLowerCase()}%' AND ${parsedOwner.queryCondition}`
      const params = `${cursor}${filter}`
      const queryTotal = `SELECT RAW COUNT(*) total_row from \`${connClass.astenposBucketName}\` WHERE type is not missing ${filter}`
      const queryRows = `SELECT META().id, META().cas \`key\` from \`${connClass.astenposBucketName}\` WHERE type is not missing ${params} ORDER BY META().cas DESC LIMIT ${limit}`
      const promises = [
        couchQueries.exec(queryRows, connClass.cluster),
        couchQueries.exec(queryTotal, connClass.cluster),
      ]
      const [resp1, resp2] = await utils.allSettled(promises)
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
      const queryTotal = `SELECT RAW COUNT(*) total_row from \`${connClass.astenposBucketName}\` WHERE type is not missing ${filter}`
      const options = {
        ...rest,
        endkey: `"${endCursor}"`,
        startkey: `"${cursor}"`,
      }
      const promises = [
        couchViews.exec(connClass.astenposBucketName, 'list_docs_all', connClass.astenposBucket, options),
        couchQueries.exec(queryTotal, connClass.cluster),
      ]
      const [data, resp2] = await utils.allSettled(promises)
      if (data.results && resp2.results) {
        data.results['total_rows'] = resp2.results[0]
      }
      res.send(data)
    }
  })
  /**
   * (`owner`,`type`,lower((meta(self).`id`)),meta(self).`cas` DESC,to_boolean((`date_closing`)))
   */
  router.get('/docs/browser', async function (req, res) {
    const { connClass, query } = req
    const parsedOwner = utils.parseOwner(req)
    const { startkey, limit = 40, text = '' } = query
    const cursor = startkey ? `AND META().cas < ${startkey} ` : ''
    const filter = text ? `AND LOWER(META().id) LIKE '%${text.toLowerCase()}%' AND ${parsedOwner.queryCondition}` : `AND ${parsedOwner.queryCondition}`
    const params = `${cursor}${filter}`
    const queryTotal = `SELECT RAW COUNT(*) total_row from \`${connClass.astenposBucketName}\` WHERE type is not missing ${filter}`
    const queryRows = `SELECT META().id, META().cas \`key\`, TOBOOLEAN(date_closing) noChannel from \`${connClass.astenposBucketName}\` WHERE type is not missing ${params} ORDER BY META().cas DESC LIMIT ${limit}`
    const promises = [
      couchQueries.exec(queryRows, connClass.cluster),
      couchQueries.exec(queryTotal, connClass.cluster),
    ]
    const [resp1, resp2] = await utils.allSettled(promises)
    const data = {
      rows: resp1.results || [],
      total_rows: resp2.results[0],
    }
    res.send({ ok: true, results: data })
  })
  router.get('/docs/get_by_id', async function (req, res) {
    const { docId: id } = req.query
    res.send(await queryById(req, { withMeta: true, id }))
  })
  router.post('/docs/bulk', async function (req, res) {
    const { connClass, body } = req
    const { data } = await axios.restApiInstance(connClass.sgPublic, connClass.sgPublicToken).post(`/${connClass.astenposBucketName}/_bulk_docs`, { docs: body.docs })
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
