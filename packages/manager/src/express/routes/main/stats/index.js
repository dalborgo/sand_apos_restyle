import { couchQueries } from '@adapter/io'
import { reqAuthGet } from '../../basicAuth'
import { getSoldStats } from './utils'

const { utils } = require(__helpers)
const knex = require('knex')({ client: 'mysql' })

function addRouters (router) {
  router.get('/stats/best_earning', async function (req, res) {
    const { connClass, query } = req
    utils.checkParameters(query, ['owner'])
    const parsedOwner = utils.parseOwner(req)
    const {
      allIn,
      bucketName = connClass.astenposBucketName,
      options,
    } = query
    const side = utils.checkSide(allIn) ? 'red' : 'blue'
    const statement = knex(bucketName)
      .where({ type: 'CLOSING_DAY' })
      .where(knex.raw(parsedOwner.queryCondition))
      .select(knex.raw(`raw max([${side}.pu_totale_totale, date, owner])`))
      .toQuery()
    const { ok, results: data, message, err } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {return res.send({ ok, message, err })}
    res.send({ ok, results: data.length ? data[0] : null })
  })
  router.get('/stats/sold', reqAuthGet, async function (req, res) {
    const { query } = req
    req.headers.internalcall = 1// skip jwt check
    utils.checkParameters(query, ['owner', 'start', 'end'])
    const data = await getSoldStats(req)
    res.send(data)
  })
}

export default {
  addRouters,
}
