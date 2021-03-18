import { couchQueries } from '@adapter/io'
import log from '@adapter/common/src/winston'
const { utils } = require(__helpers)
const knex = require('knex')({ client: 'mysql' })

export async function getSoldStats (req) {
  const { connClass, query } = req
  const bucketName = connClass.astenposBucketName
  const parsedOwner = utils.parseOwner(req, 'buc')
  const { start, end, startTime, endTime, bb } = query
  log.debug('query:', query)
  let filters = (!bb || bb === 'false') ? ' and buc.mode != "PRECHECK"' : ''
  if (startTime && endTime) {
    filters += startTime > endTime ? ` and substr(buc.date, 8) not between "${endTime}00000" and "${startTime}00000"` : ` and substr(buc.date, 8) between "${startTime}00000" and "${endTime}00000"`
  }
  const statement = knex.from(knex.raw(`\`${bucketName}\` buc unnest buc.entries ent`))
    .select(knex.raw('ent.product_display product, '
                     + 'sum(ent.product_qta) productQta, '
                     + 'ifnull(ent.product_category_display, "") category, '
                     + 'sum(ent.product_price * ent.product_qta) price'))
    .where({ 'buc.type': 'PAYMENT' })
    .where({ 'buc.archived': true })
    .whereBetween('ent.date', [start, end])
    .where(knex.raw(
      parsedOwner.queryCondition + ''
      + filters)
    )
    .groupBy(['ent.product_category_display', 'ent.product_display'])
    .havingRaw('sum(ent.product_qta) > 0')
    .orderBy(['category', 'product'])
    .toQuery()
  return couchQueries.exec(statement, connClass.cluster)
}
