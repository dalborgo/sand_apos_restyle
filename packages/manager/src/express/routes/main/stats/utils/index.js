import { couchQueries } from '@adapter/io'
import log from '@adapter/common/src/winston'
import get from 'lodash/get'
import isNil from 'lodash/isNil'

const { utils } = require(__helpers)
const knex = require('knex')({ client: 'mysql' })

function getFilters (bb, startTime, endTime, bucketLabel = 'buc') {
  let filters = (!bb || bb === 'false') ? ' and buc.mode != "PRECHECK"' : ''
  if (startTime && endTime) {
    filters += startTime > endTime ? ` and substr(${bucketLabel}.date, 8) not between "${endTime}00000" and "${startTime}00000"` : ` and substr(${bucketLabel}.date, 8) between "${startTime}00000" and "${endTime}00000"`
  }
  return filters
}

export async function getSoldStats (req) {
  const { connClass, query } = req
  const bucketName = connClass.astenposBucketName
  const parsedOwner = utils.parseOwner(req, 'buc')
  const { start, end, startTime, endTime, bb } = query
  log.debug('query:', query)
  const promises = []
  const statement = knex.from(knex.raw(`\`${bucketName}\` buc unnest buc.entries ent`))
    .select(knex.raw('ent.product_display product, '
                     + 'sum(ent.product_qta) productQta, '
                     + 'ifnull(ent.product_category_display, "") category, '
                     + 'sum(ent.product_price * ent.product_qta) price'))
    .where({ 'buc.type': 'PAYMENT' })
    .where({ 'buc.archived': true })
    .whereBetween('ent.date', [start, end])
    .where(knex.raw(
      parsedOwner.queryCondition
      + getFilters(bb, startTime, endTime, 'ent'))
    )
    .groupBy(['ent.product_category_display', 'ent.product_display'])
    .havingRaw('sum(ent.product_qta) > 0')
    .orderBy(['category', 'product'])
    .toQuery()
  promises.push(couchQueries.exec(statement, connClass.cluster))
  {
    const statement = knex({ buc: bucketName })
      .select(knex.raw('sum(buc.covers) productQta, sum(buc.covers * buc.cover_price) price'))
      .where({ 'buc.type': 'PAYMENT' })
      .where({ 'buc.archived': true })
      .where(knex.raw(
        parsedOwner.queryCondition + ' '
        + 'and buc.entries[0].date between "' + start + '" and "' + end + '"'
        + getFilters(bb, startTime, endTime, 'buc.entries[0]'))
      )
      .toQuery()
    promises.push(couchQueries.exec(statement, connClass.cluster))
  }
  const [soldResponse, coversResponse] = await Promise.all(promises)
  const covers = get(coversResponse, 'results[0]')
  const results = !isNil(covers['productQta']) ? [{ ...covers, category: '', product: 'COPERTI' }, ...soldResponse.results] : soldResponse.results
  return {
    ok: true,
    results,
  }
}
