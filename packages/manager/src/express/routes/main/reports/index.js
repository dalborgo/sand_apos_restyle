import { couchQueries } from '@adapter/io'
import moment from 'moment'

const { utils } = require(__helpers)
const knex = require('knex')({ client: 'mysql' })

function addRouters (router) {
  router.get('/reports/closing_days', async function (req, res) {
    const { connClass, query } = req
    utils.controlParameters(query, ['startDateInMillis', 'endDateInMillis', 'owner'])
    const parsedOwner = utils.parseOwner(req)
    const {
      bucketName = connClass.astenposBucketName,
      options,
      startDateInMillis: startDate,
      endDateInMillis: endDate,
    } = query
    const endDate_ = moment(endDate, 'YYYYMMDDHHmmssSSS').endOf('day').format('YYYYMMDDHHmmssSSS') //end day
    const statement = knex(bucketName)
      .where({ type: 'CLOSING_DAY' })
      .where(knex.raw(parsedOwner.queryCondition))
      .whereBetween('date', [startDate, endDate_])
      .select(knex.raw('meta().id _id'))
      .select(['owner', 'date', 'pu_totale_sc', 'pu_totale_st', 'pu_totale_nc', 'pu_totale_totale'])
      .orderBy('date', 'desc')
      .toQuery()
    const { ok, results: data, message, info } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: data })
  })
  
  router.get('/reports/running_tables', async function (req, res) {
    const { connClass, query } = req
    utils.controlParameters(query, ['owner'])
    const parsedOwner = utils.parseOwner(req, 'buc')
    const {
      bucketName = connClass.astenposBucketName,
      tableFilter,
      roomFilter,
      options,
    } = query
    const statement = knex({ buc: bucketName }).where(knex.raw(`${parsedOwner.queryCondition} AND buc.type = "ORDER"`))
    roomFilter && statement.where('buc.room', roomFilter)
    tableFilter && statement.where('buc.table_display', 'like', `%${tableFilter}%`)
    statement.select(knex.raw('meta(buc).id _id'))
      .select(['buc.owner', 'buc.creation_date', 'buc.table_display', 'buc.room_display', 'buc.covers', 'user.user'])
      .select(knex.raw('ARRAY_SUM(ARRAY((e.product_price + ARRAY_SUM(ARRAY o.variant_qta * o.variant_price FOR o IN e.orderVariants END)) * e.product_qta) FOR e IN buc.entries WHEN e.deleted != TRUE END) + buc.cover_price * buc.covers AS income'))
      .joinRaw('JOIN `' + bucketName + '` as `user` ON KEYS buc.creating_user')
      .orderBy('buc.creation_date', 'desc')
    const { ok, results: data, message, info } = await couchQueries.exec(statement.toQuery(), connClass.cluster, options)
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: data })
  })
  
  router.get('/reports/running_table/:orderId', async function (req, res) {
    const { connClass, query, params } = req
    utils.controlParameters(query, ['owner'])
    utils.controlParameters(params, ['orderId'])
    const { orderId } = params
    const parsedOwner = utils.parseOwner(req, 'buc')
    const {
      bucketName = connClass.astenposBucketName,
      options,
    } = query
    const statement = knex
      .from(knex.raw(`${bucketName} buc USE KEYS "${orderId}" LEFT NEST ${bucketName} us ON KEYS ARRAY x.\`user\` FOR x IN buc.entries END`))
      .select(['buc.table_display', 'buc.room_display'])
      .select(knex.raw('CASE WHEN buc.covers > 0 THEN ARRAY_PREPEND({"date":buc.creation_date, "pro_qta": buc.covers, "amount": buc.cover_price * buc.covers, "user":`user`.`user`, "intl_code": "common_covers"}, arr_entries) ELSE arr_entries END AS entries'))
      .joinRaw('JOIN `' + bucketName + '` as `user` ON KEYS buc.creating_user LET arr_entries = ARRAY {"pro_qta": e.product_qta, "pro_display": e.product_display, "cat_display": e.product_category_display, "date": e.date, "user": FIRST v.`user` FOR v IN us WHEN META(v).id = e.`user` END, "amount": (e.product_price + ARRAY_SUM(ARRAY o.variant_qta * o.variant_price FOR o IN e.orderVariants END)) * e.product_qta} FOR e IN buc.entries WHEN e.deleted != TRUE END')
      .orderBy('buc.creation_date', 'desc')
      .where(knex.raw(`${parsedOwner.queryCondition}`))
      .toQuery()
    const { ok, results: data, message, info } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: data.length ? data[0] : null })
  })
}

export default {
  addRouters,
}
