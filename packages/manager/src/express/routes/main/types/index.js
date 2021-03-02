import { couchQueries } from '@adapter/io'

const { utils } = require(__helpers)
const knex = require('knex')({ client: 'mysql' })

/**
 * @param req
 * @param type
 * @param params_: {_id, order} -> `id` consents di scegliere un altro campo come id
 */

export function execTypesQuery (req, type, params_ = {}) {
  const { connClass, query } = req
  const { params } = query || {}
  const { _id, order, columns = [], includeId = true } = { ...params_, ...params }
  utils.controlParameters(query, ['owner'])
  const parsedOwner = utils.parseOwner(req)
  const {
    bucketName = connClass.astenposBucketName,
    options,
  } = query
  const statement = knex(bucketName)
    .where({ type })
    .where(knex.raw(parsedOwner.queryCondition))
    .select('display')
    .select(columns)
  if (includeId) {
    statement.select(knex.raw(`${_id ? '`' + _id + '`' : 'meta().id'} _id`))
  }
  if (order) {
    statement.orderBy(order)
  }
  return couchQueries.exec(statement.toQuery(), connClass.cluster, options)
}

function addRouters (router) {
  router.get('/types/rooms', async function (req, res) {
    const { ok, results: data, message, info } = await execTypesQuery(req, 'ROOM')
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: data })
  })
  router.get('/types/incomes', async function (req, res) {
    const { ok, results: data, message, info } = await execTypesQuery(req, 'PAYMENT_INCOME', { order: 'index', columns: ['key'] })
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: data })
  })
}

export default {
  addRouters,
}
