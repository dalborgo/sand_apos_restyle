import { couchQueries } from '@adapter/io'
import moment from 'moment'
import groupBy from 'lodash/groupBy'
import concat from 'lodash/concat'

const { utils } = require(__helpers)
const knex = require('knex')({ client: 'mysql' })

const getMergedEntries = data => {
  const all = data.reduce((prev, curr) => concat(prev, curr.entries), [])
  const uids = {}
  return all.reduce((prev, curr) => {
    if (!uids[curr.id]) {
      uids[curr.id] = 1
      !curr.deleted && prev.push(curr)
    }
    return prev
  }, [])
}

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
      .select('owner', 'date', 'pu_totale_sc', 'pu_totale_st', 'pu_totale_nc', 'pu_totale_totale')
      .orderBy('date', 'desc')
      .toQuery()
    const { ok, results, message, info } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results })
  })
  
  /**
   *  covered index
   *  CREATE INDEX adv_covered_closed_tables ON `astenpos`(`room`,`archived`,`date`,`mode`,`final_price`,`room_display`,`order_id`,`discount_price`,`income`,`closed_by`,`table_display`,`covers`,`owner`) WHERE (`type` = 'PAYMENT')
   */
  router.get('/reports/closed_tables', async function (req, res) {
    const { connClass, query } = req
    utils.controlParameters(query, ['owner'])
    const parsedOwner = utils.parseOwner(req, 'buc')
    const {
      bucketName = connClass.astenposBucketName,
      tableFilter,
      roomFilter,
      options,
      startDateInMillis: startDate,
      endDateInMillis: endDate,
    } = query
    const endDate_ = moment(endDate, 'YYYYMMDDHHmmssSSS').endOf('day').format('YYYYMMDDHHmmssSSS') //end day
    const statement = knex({ buc: bucketName }).where(knex.raw(`${parsedOwner.queryCondition} AND buc.type = "PAYMENT"`))
    roomFilter && statement.where('buc.room', roomFilter)
    tableFilter && statement.whereRaw(`LOWER(buc.table_display) like "%${tableFilter.toLowerCase()}%"`)
    statement.column({ _id: 'buc.order_id' })
      .select(knex.raw('MAX(buc.date) date, '
                       + 'SUM(buc.covers) covers, '
                       + 'SUM(buc.final_price) final_price, '
                       + 'SUM(buc.discount_price) discount_price, '
                       + 'ARRAY_AGG(buc.table_display)[0] table_display, '
                       + 'ARRAY_AGG(buc.room_display)[0] room_display, '
                       + 'ARRAY_AGG(`user`.`user`)[0] `user`, '
                       + 'ARRAY_AGG(income.display)[0] income, '
                       + 'ARRAY_AGG(buc.owner)[0] owner, '
                       + 'CASE WHEN COUNT(buc.mode) > 1 THEN false ELSE ARRAY_AGG(buc.mode)[0] END mode'))
      .joinRaw('LEFT JOIN `' + bucketName + '` as `user` ON KEYS buc.closed_by')
      .joinRaw('LEFT JOIN `' + bucketName + '` as income ON KEYS "PAYMENT_INCOME_" || buc.income')
      .whereBetween('buc.date', [startDate, endDate_])
      .groupBy('buc.order_id')
      .orderBy('date', 'desc')
    const {
      ok,
      results,
      message,
      info,
    } = await couchQueries.exec(statement.toQuery(), connClass.cluster, options)
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results })
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
    tableFilter && statement.whereRaw(`LOWER(buc.table_display) like "%${tableFilter.toLowerCase()}%"`)
    statement.column({ _id: 'buc.order_id' })
      .select('buc.owner', 'buc.last_saved_date', 'buc.table_display', 'buc.room_display', 'buc.covers', 'buc.cover_price', 'user.user')
      .select(knex.raw('ARRAY({"id": e.id, "deleted": e.deleted, "amount":(e.product_price + ARRAY_SUM(ARRAY o.variant_qta * o.variant_price FOR o IN e.orderVariants END)) * e.product_qta}) FOR e IN buc.entries END AS entries'))
      .joinRaw('LEFT JOIN `' + bucketName + '` as `user` ON KEYS buc.creating_user')
      .orderBy('buc.last_saved_date', 'desc')
    const {
      ok,
      results: data,
      message,
      info,
    } = await couchQueries.exec(statement.toQuery(), connClass.cluster, options)
    const grouped = groupBy(data, 'order_id')
    const rows = []
    for (let key in grouped) {
      const entries = getMergedEntries(grouped[key])
      const [first] = grouped[key]
      rows.push({
        ...first,
        income: (first.covers * first.cover_price) + entries.reduce((prev, curr) => prev + curr.amount, 0),
        entries: undefined,
        cover_price: undefined,
      })
    }
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: rows })
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
      .from(knex.raw(`${bucketName} buc LEFT NEST ${bucketName} us ON KEYS ARRAY x.\`user\` FOR x IN buc.entries END`))
      .select('buc.table_display', 'buc.room_display')
      .select(knex.raw('CASE WHEN buc.covers > 0 THEN ARRAY_PREPEND({"id": "common_covers", "date":buc.creation_date, "pro_qta": buc.covers, "amount": buc.cover_price * buc.covers, "user":`user`.`user`, "intl_code": "common_covers"}, arr_entries) ELSE arr_entries END AS entries'))
      .joinRaw('LEFT JOIN `' + bucketName + '` as `user` ON KEYS buc.creating_user LET arr_entries = ARRAY {"id": e.id, "pro_qta": e.product_qta, "pro_display": e.product_display, "cat_display": e.product_category_display, "date": e.date, "user": FIRST v.`user` FOR v IN us WHEN META(v).id = e.`user` END, "amount": (e.product_price + ARRAY_SUM(ARRAY o.variant_qta * o.variant_price FOR o IN e.orderVariants END)) * e.product_qta} FOR e IN buc.entries END')
      .where(knex.raw(`${parsedOwner.queryCondition} AND buc.order_id = "${orderId}"`))
      .toQuery()
    const { ok, results: data, message, info } = await couchQueries.exec(statement, connClass.cluster, options)
    let row = null
    if (data.length) {
      const entries = getMergedEntries(data)
      const [first] = data
      row = {
        ...first,
        entries,
      }
    }
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results: row })
  })
}

export default {
  addRouters,
}
