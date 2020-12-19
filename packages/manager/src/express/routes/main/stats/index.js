import { couchQueries } from '@adapter/io'

const { utils } = require(__helpers)
const knex = require('knex')({ client: 'mysql' })

function addRouters (router) {
  router.get('/stats/best_earning', async function (req, res) {
    const { connClass, query } = req
    utils.controlParameters(query, ['owner'])
    const parsedOwner = utils.parseOwner(req)
    const {
      bucketName = connClass.astenposBucketName,
      options,
    } = query
    const statement = knex(bucketName)
      .where({ type: 'CLOSING_DAY' })
      .where(knex.raw(parsedOwner.queryCondition))
      .select(knex.raw('raw max([pu_totale_totale, date, owner])'))
      .toQuery()
    const { ok, results: data, message, info } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: data.length ? data[0] : null })
  })
}

export default {
  addRouters,
}
