import { couchQueries } from '@adapter/io'

const { utils } = require(__helpers)
const knex = require('knex')({ client: 'mysql' })

function addRouters (router) {
  router.get('/types/rooms', async function (req, res) {
    const { connClass, query } = req
    utils.controlParameters(query, ['owner'])
    const parsedOwner = utils.parseOwner(query)
    const {
      bucketName = connClass.astenposBucketName,
      options,
    } = query
    const statement = knex(bucketName)
      .where({ type: 'ROOM' })
      .where(knex.raw(parsedOwner.queryCondition))
      .select(knex.raw('meta().id _id'))
      .select(['display'])
      .toQuery()
    const { ok, results: data, message, info } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: data })
  })
}

export default {
  addRouters,
}
