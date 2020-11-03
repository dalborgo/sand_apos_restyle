import { couchQueries } from '@adapter/io'
const knex = require('knex')({ client: 'mysql' })

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
    const { ok, results: data, message, info } = await couchQueries.execByService(statement, connClass.astConnection, options)
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: data })
  })
  
  router.post('/queries/query_by_id', async function (req, res) {
    const { connClass, body } = req
    const { id, columns, bucketName = connClass.astenposBucketName, options } = body
    const statement = `${knex.select(columns).from(bucketName).toQuery()} USE KEYS "${id}"`
    const { ok, results: data, message, info } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: data })
  })
}

export default {
  addRouters,
}
