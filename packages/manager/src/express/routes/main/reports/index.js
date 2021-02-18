import { couchQueries } from '@adapter/io'
import moment from 'moment'
import groupBy from 'lodash/groupBy'
import concat from 'lodash/concat'
import find from 'lodash/find'
import sortBy from 'lodash/sortBy'
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
const getCombinedEntries = data => {
  const all = data.reduce((prev, curr) => concat(prev, curr.entries), [])
  return all.reduce((prev, curr) => {
    const found = find(prev, { id: curr.id })
    if (found) {
      found.pro_qta += curr.pro_qta
      found.amount += curr.amount
    } else {
      prev.push(curr)
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
      allIn,
      bucketName = connClass.astenposBucketName,
      options,
      startDateInMillis: startDate,
      endDateInMillis: endDate,
    } = query
    const endDate_ = moment(endDate, 'YYYYMMDDHHmmssSSS').endOf('day').format('YYYYMMDDHHmmssSSS') // end day
    const side = utils.checkSide(allIn) ? 'red' : 'blue'
    const statement = knex(bucketName)
      .where({ type: 'CLOSING_DAY' })
      .where(knex.raw(parsedOwner.queryCondition))
      .where(`${side}.pu_totale_totale`, '>', 0)
      .whereBetween('date', [startDate, endDate_])
      .select(knex.raw('meta().id _id'))
      .select('owner', 'date', `${side}.pu_totale_sc`, `${side}.pu_totale_st`, `${side}.pu_totale_nc`, `${side}.pu_totale_totale`)
      .orderBy('date', 'desc')
      .toQuery()
    const { ok, results, message, err } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {return res.send({ ok, message, err })}
    res.send({ ok, results })
  })
  
  router.get('/reports/e_invoices', async function (req, res) {
    const { connClass, query } = req
    utils.controlParameters(query, ['startDateInMillis', 'endDateInMillis', 'owner'])
    const parsedOwner = utils.parseOwner(req, 'buc')
    const {
      bucketName = connClass.astenposBucketName,
      options,
      startDateInMillis: startDate,
      endDateInMillis: endDate,
    } = query
    const endDate_ = moment(endDate, 'YYYYMMDDHHmmssSSS').endOf('day').format('YYYYMMDDHHmmssSSS') // end day
    const statement = knex({ buc: bucketName })
      .where({ 'buc.type': 'PAYMENT' })
      .where({ 'buc.mode': 'INVOICE' })
      .where({ 'buc.archived': true })
      .where(knex.raw(parsedOwner.queryCondition))
      .whereBetween('buc.date', [startDate, endDate_])
      .joinRaw('LEFT JOIN `' + bucketName + '` as `user` ON KEYS buc.closed_by')
      .select(knex.raw('meta(buc).id _id, buc.customer.company, buc.customer._id company_id, `user`.`user` closed_by'))
      .select('buc.owner', 'buc.date', 'buc.number', 'buc.final_price', 'buc.room_display', 'buc.table_display')
      .orderBy('buc.date', 'desc')
      .toQuery()
    const { ok, results, message, err } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {return res.send({ ok, message, err })}
    res.send({ ok, results })
  })
  
  /**
   *  covered index
   *  CREATE INDEX adv_covered_closed_tables ON `astenpos`(`archived`,`date`,`mode`,`final_price`,`room_display`,`order`,`discount_price`,`income`,`closed_by`,`table_display`,`covers`,`owner`,`number`) WHERE (`type` = 'PAYMENT')
   */
  router.get('/reports/closed_tables', async function (req, res) {
    const { connClass, query } = req
    utils.controlParameters(query, ['owner', 'startDateInMillis', 'endDateInMillis'])
    const parsedOwner = utils.parseOwner(req, 'buc')
    const {
      allIn,
      bucketName = connClass.astenposBucketName,
      tableFilter,
      modeFilter,
      roomFilter,
      options,
      startDateInMillis: startDate,
      endDateInMillis: endDate,
    } = query
    const endDate_ = moment(endDate, 'YYYYMMDDHHmmssSSS').endOf('day').format('YYYYMMDDHHmmssSSS') // end day
    const mode = modeFilter ? ` AND buc.mode = "${modeFilter}"` : ''
    const side = utils.checkSide(allIn) ? '' : ' AND buc.mode != "PRECHECK"'
    const statement = knex({ buc: bucketName })
      .from(knex.raw(`\`${bucketName}\` buc USE INDEX (adv_covered_closed_tables USING GSI)`))
      .where(knex.raw(`${parsedOwner.queryCondition} AND buc.type = "PAYMENT"${side}${mode} AND buc.archived = TRUE`))
    roomFilter && statement.where('buc.room_display', roomFilter)
    tableFilter && statement.whereRaw(`LOWER(buc.table_display) like "%${tableFilter.toLowerCase()}%"`)
    statement.column({ _id: 'buc.order' })
      .select(knex.raw('MAX(buc.date) date, '
                       + 'SUM(buc.covers) covers, '
                       + 'SUM(buc.final_price) final_price, '
                       + 'SUM(buc.discount_price) discount_price, '
                       + 'ARRAY_AGG(buc.table_display)[0] table_display, '
                       + 'ARRAY_AGG(buc.room_display)[0] room_display, '
                       + 'ARRAY_AGG(buc.owner)[0] owner, '
                       + 'CASE WHEN COUNT(*) > 1 THEN ARRAY_SORT(ARRAY_AGG({"number":buc.`number`, "_date": -1 * TONUMBER(buc.date), "final_price": buc.final_price, "_id": META(buc).id, "mode": buc.mode, "covers": buc.covers, "income": income.display, "closed_by": `user`.`user`})) ELSE ARRAY_AGG({"number":buc.`number`, "mode": buc.mode, "_id": META(buc).id, "income": income.display, "closed_by": `user`.`user`})[0] END payments'))
      .joinRaw('LEFT JOIN `' + bucketName + '` as `user` ON KEYS buc.closed_by')
      .joinRaw('LEFT JOIN `' + bucketName + '` as income ON KEYS buc.income')
      .whereBetween('buc.date', [startDate, endDate_])
      .groupBy('buc.order')
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
    roomFilter && statement.where('buc.room_display', roomFilter)
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
      .from(knex.raw(`\`${bucketName}\` buc LEFT NEST \`${bucketName}\` us ON KEYS ARRAY x.\`user\` FOR x IN buc.entries END`))
      .select('buc.table_display', 'buc.room_display')
      .select(knex.raw('CASE WHEN buc.covers > 0 THEN ARRAY_PREPEND({"id": "common_covers", "date": "", "pro_qta": buc.covers, "amount": buc.cover_price * buc.covers, "user":`user`.`user`, "intl_code": "common_covers"}, arr_entries) ELSE arr_entries END AS entries'))
      .joinRaw('LEFT JOIN `' + bucketName + '` as `user` ON KEYS buc.creating_user LET arr_entries = ARRAY {"id": e.id, "pro_qta": e.product_qta, "pro_display": e.product_display, "cat_display": e.product_category_display, "date": e.date, "user": FIRST v.`user` FOR v IN us WHEN META(v).id = e.`user` END, "amount": (e.product_price + ARRAY_SUM(ARRAY o.variant_qta * o.variant_price FOR o IN e.orderVariants END)) * e.product_qta} FOR e IN buc.entries END')
      .where(knex.raw(`${parsedOwner.queryCondition} AND buc.type = "ORDER" AND buc.order_id = "${orderId}"`))
      .toQuery()
    const { ok, results: data, message, err } = await couchQueries.exec(statement, connClass.cluster, options)
    let row = null
    if (data.length) {
      const entries = sortBy(getMergedEntries(data), ['date'])
      const [first] = data
      row = {
        ...first,
        entries,
      }
    }
    if (!ok) {return res.send({ ok, message, err })}
    res.send({ ok, results: row })
  })
  router.get('/reports/closed_table/:orderId', async function (req, res) {
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
      .from(knex.raw(`\`${bucketName}\` buc LEFT NEST \`${bucketName}\` us ON KEYS ARRAY x.\`user\` FOR x IN buc.entries END`))
      .select('buc.table_display', 'buc.room_display')
      .select(knex.raw('CASE WHEN buc.covers > 0 THEN ARRAY_PREPEND({"id": "common_covers", "date": "", "pro_qta": buc.covers, "amount": buc.cover_price * buc.covers, "user":`user`.`user`, "intl_code": "common_covers"}, arr_entries) ELSE arr_entries END AS entries'))
      .joinRaw('LEFT JOIN `' + bucketName + '` as `user` ON KEYS buc.closed_by LET arr_entries = ARRAY {"id": e.product_id, "pro_qta": e.product_qta, "pro_display": e.product_display, "cat_display": e.product_category_display, "date": e.date, "user": FIRST v.`user` FOR v IN us WHEN META(v).id = e.`user` END, "amount": (e.product_price + ARRAY_SUM(ARRAY o.variant_qta * o.variant_price FOR o IN e.orderVariants END)) * e.product_qta} FOR e IN buc.entries END')
      .where(knex.raw(`${parsedOwner.queryCondition} AND buc.type = "PAYMENT" AND buc.\`order\` = "${orderId}" AND buc.archived = TRUE`))
      .toQuery()
    const { ok, results: data, message, err } = await couchQueries.exec(statement, connClass.cluster, options)
    let row = null
    if (data.length) {
      const entries = sortBy(getCombinedEntries(data), ['date'])
      const [first] = data
      row = {
        ...first,
        entries,
      }
    }
    if (!ok) {return res.send({ ok, message, err })}
    res.send({ ok, results: row })
  })
  router.get('/reports/e_invoice/:paymentId', async function (req, res) {
    const { connClass, query, params } = req
    utils.controlParameters(query, ['owner'])
    utils.controlParameters(params, ['paymentId'])
    const { paymentId } = params
    const parsedOwner = utils.parseOwner(req, 'buc')
    const {
      bucketName = connClass.astenposBucketName,
      options,
    } = query
    const statement = knex
      .from(knex.raw(`\`${bucketName}\` buc USE KEYS '${paymentId}' LEFT NEST \`${bucketName}\` us ON KEYS ARRAY x.\`user\` FOR x IN buc.entries END`))
      .select('buc.table_display', 'buc.room_display')
      .select(knex.raw('CASE WHEN buc.covers > 0 THEN ARRAY_PREPEND({"id": "common_covers", "date": "", "pro_qta": buc.covers, "amount": buc.cover_price * buc.covers, "user":`user`.`user`, "intl_code": "common_covers"}, arr_entries) ELSE arr_entries END AS entries'))
      .joinRaw('LEFT JOIN `' + bucketName + '` as `user` ON KEYS buc.closed_by LET arr_entries = ARRAY {"id": e.product_id, "pro_qta": e.product_qta, "pro_display": e.product_display, "cat_display": e.product_category_display, "date": e.date, "user": FIRST v.`user` FOR v IN us WHEN META(v).id = e.`user` END, "amount": (e.product_price + ARRAY_SUM(ARRAY o.variant_qta * o.variant_price FOR o IN e.orderVariants END)) * e.product_qta} FOR e IN buc.entries END')
      .where(knex.raw(`${parsedOwner.queryCondition} AND buc.type = "PAYMENT" AND buc.archived = TRUE`))
      .toQuery()
    const { ok, results: data, message, err } = await couchQueries.exec(statement, connClass.cluster, options)
    let row = null
    if (data.length) {
      const [first] = data
      row = {
        ...first,
      }
    }
    if (!ok) {return res.send({ ok, message, err })}
    res.send({ ok, results: row })
  })
}

export default {
  addRouters,
}
