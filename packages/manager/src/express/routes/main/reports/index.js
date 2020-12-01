import { couchQueries } from '@adapter/io'

const { utils } = require(__helpers)
const knex = require('knex')({ client: 'mysql' })

function addRouters (router) {
  router.get('/reports/closing_days', async function (req, res) {
    const { connClass, query } = req
    utils.controlParameters(query, ['startDateInMillis', 'endDateInMillis', 'owner'])
    const parsedOwner = utils.parseOwner(query)
    const { bucketName = connClass.astenposBucketName, options, startDateInMillis: startDate, endDateInMillis: endDate } = query
    const statement = knex(bucketName)
      .where({ type: 'CLOSING_DAY' })
      .where(knex.raw(parsedOwner.queryCondition))
      .whereBetween('close_date', [startDate, endDate])
      .select(knex.raw('meta().id _id'))
      .select(['owner', 'close_date', 'pu_totale_sc', 'pu_totale_st', 'day_stelle'])
      .orderBy('close_date', 'desc')
      .toQuery()
    const { ok, results: data, message, info } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: data })
  })
}

export default {
  addRouters,
}
