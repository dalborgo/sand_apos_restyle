import { couchQueries } from '@adapter/io'

const { utils } = require(__helpers)
const knex = require('knex')({ client: 'mysql' })

function execTypesQuery (req, type) {
  const { connClass, query } = req
  utils.controlParameters(query, ['owner'])
  const parsedOwner = utils.parseOwner(req)
  const {
    bucketName = connClass.astenposBucketName,
    options,
  } = query
  const statement = knex(bucketName)
    .where({ type })
    .where(knex.raw(parsedOwner.queryCondition))
    .select(knex.raw('meta().id _id'))
    .select(['display'])
    .toQuery()
  return couchQueries.exec(statement, connClass.cluster, options)
}

function addRouters (router) {
  router.get('/types/rooms', async function (req, res) {
    const { ok, results: data, message, info } = await execTypesQuery(req, 'ROOM')
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: data })
  })
  router.get('/types/incomes', async function (req, res) {
    const { ok, results: data, message, info } = await execTypesQuery(req, 'PAYMENT_INCOME')
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: data })
  })
}

export default {
  addRouters,
}
