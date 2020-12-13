import { couchQueries } from '@adapter/io'

const { utils } = require(__helpers)
const knex = require('knex')({ client: 'mysql' })

async function queryByType (req, res) {
  const { connClass, body, query } = req
  const parsedOwner = utils.parseOwner(req)
  const { type, columns, withMeta = false, bucketName = connClass.astenposBucketName, options } = Object.assign({}, body, query)
  const knex_ = knex({ buc: bucketName }).where({ type }).where(knex.raw(parsedOwner.queryCondition)).select(columns || 'buc.*')
  if (withMeta) {knex_.select(knex.raw('meta().id _id, meta().xattrs._sync.rev _rev'))}
  const statement = knex_.toQuery()
  const { ok, results: data, message, info } = await couchQueries.exec(statement, connClass.cluster, options)
  if (!ok) {return res.send({ ok, message, info })}
  res.send({ ok, results: data })
}

async function queryById (req, res) {
  const { connClass, body, query } = req
  const parsedOwner = utils.parseOwner(req)
  const { id, columns, withMeta = false, bucketName = connClass.astenposBucketName, options } = Object.assign({}, body, query)
  const knex_ = knex({ buc: bucketName }).select(columns || 'buc.*')
  if (withMeta) {knex_.select(knex.raw('meta().id _id, meta().xattrs._sync.rev _rev'))}
  const statement = `${knex_.toQuery()} USE KEYS "${id}" WHERE ${parsedOwner.queryCondition}`
  const { ok, results: data, message, info } = await couchQueries.exec(statement, connClass.cluster, options)
  if (!ok) {return res.send({ ok, message, info })}
  res.send({ ok, results: data.length ? data[0] : null })
}

function addRouters (router) {
  router.post('/queries/raw_query', async function (req, res) {
    const { connClass, body } = req
    const { statement, options } = body
    const { ok, results: data, message } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {return res.send({ ok, message })}
    const [results] = data
    res.send({ ok, results })
  })
  router.post('/queries/raw_query_service', async function (req, res) {
    const { connClass, body } = req
    const { statement, options } = body
    const {
      ok,
      results: data,
      message,
      info,
    } = await couchQueries.execByService(statement, connClass.astConnection, options)
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: data })
  })
  router.post('/queries/query_by_id', async function (req, res) {
    return await queryById(req, res)
  })
  router.get('/queries/query_by_id', async function (req, res) {
    return await queryById(req, res)
  })
  router.post('/queries/query_by_type', async function (req, res) {
    return await queryByType(req, res)
  })
  router.get('/queries/query_by_type', async function (req, res) {
    return await queryByType(req, res)
  })
}

export default {
  addRouters,
}
