import { couchQueries } from '@adapter/io'
import { cFunctions } from '@adapter/common'
import isObject from 'lodash/isObject'
import isString from 'lodash/isString'
import get from 'lodash/get'
import dot from 'dot-object'

const { BadRequest } = require(__errors)
const { utils } = require(__helpers)
const knex = require('knex')({ client: 'mysql' })

async function queryByType (req) {
  const { connClass, body, query } = req
  const parsedOwner = utils.parseOwner(req)
  const {
    type,
    columns,
    withMeta = false,
    bucketName = connClass.astenposBucketName,
    where,
    options,
  } = Object.assign({}, body, query)
  utils.controlParameters({ type }, ['type'])
  const knex_ = knex({ buc: bucketName }).where({ type }).select(columns || 'buc.*')
  if (where) {knex_.where(where)}
  if (parsedOwner.queryCondition) {knex_.where(knex.raw(parsedOwner.queryCondition))}
  if (withMeta) {knex_.select(knex.raw('meta().id _id, meta().xattrs._sync.rev _rev'))}
  const statement = knex_.toQuery()
  const { ok, results, message, err } = await couchQueries.exec(statement, connClass.cluster, options)
  if (!ok) {return { ok, message, err }}
  return { ok, results }
}

export async function queryById (req, extra) {
  const { connClass, body, query } = req
  const parsedOwner = utils.parseOwner(req)
  const {
    id,
    columns,
    withMeta = false,
    bucketName = connClass.astenposBucketName,
    options,
  } = Object.assign({}, body, query, extra)
  utils.controlParameters({ id }, ['id'])
  const conditions = parsedOwner.queryCondition ? ` WHERE ${parsedOwner.queryCondition}` : '' //impedisce di accedere ad altri docs da portale
  const knex_ = knex({ buc: bucketName }).select(columns || 'buc.*')
  if (withMeta) {knex_.select(knex.raw('meta().id _id, meta().xattrs._sync.rev _rev'))}
  const statement = `${knex_.toQuery()} USE KEYS "${id}"${conditions}`
  const { ok, results: data, message, err } = await couchQueries.exec(statement, connClass.cluster, options)
  if (!ok) {return { ok, message, err }}
  return { ok, results: data.length ? data[0] : null }
}

function createSetStatement (val) {
  const toSet = []
  for (let key in dot.dot(val)) {
    let value = get(val, key)
    value = isString(value) ? `"${value}"` : value
    toSet.push(`${cFunctions.escapeN1qlObj(key)} = ${value}`)
  }
  return `SET ${toSet.join(', ')}`
}

function createUnsetStatement (val) {
  let toUnset
  if (Array.isArray(val)) {
    toUnset = val
  } else if (isObject(val)) {
    toUnset = Object.keys(dot.dot(val))
  } else {
    toUnset = [String(val)]
  }
  const toUnset_ = toUnset.map(val_ => {
    return cFunctions.escapeN1qlObj(val_)
  })
  return `UNSET ${toUnset_.join(', ')}`
}

function addRouters (router) {
  router.post('/queries/raw_query', async function (req, res) {
    const { connClass, body } = req
    utils.parseOwner(req) //security check
    const { statement, options } = body
    const { ok, results: data, message, err } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {return res.send({ ok, message, err })}
    const [results] = data
    res.send({ ok, results })
  })
  router.post('/queries/raw_query_service', async function (req, res) {
    const { connClass, body } = req
    const { statement, options } = body
    const {
      ok,
      results,
      message,
      info,
    } = await couchQueries.execByService(statement, connClass.astConnection, options)
    if (!ok) {return res.send({ ok, message, info })}
    res.send({ ok, results })
  })
  router.post('/queries/query_by_id', async function (req, res) {
    res.send(await queryById(req))
  })
  router.get('/queries/query_by_id', async function (req, res) {
    res.send(await queryById(req))
  })
  router.post('/queries/query_by_type', async function (req, res) {
    res.send(await queryByType(req))
  })
  router.get('/queries/query_by_type', async function (req, res) {
    res.send(await queryByType(req))
  })
  /**
   * body con almeno un campo tra `set` e `unset` con i valori da modificare
   * {
   *   set :{
   *     type: 'NEW'
   *   }
   *   unset: {
   *     prova: 'xxx'
   *   }
   *   oppure unset: ['prova']
   * }
   */
  router.put('/queries/update_by_id', async function (req, res) {
    const { connClass, body } = req
    utils.controlParameters(body, ['owner', 'id'])
    if (!isObject(body.set) && !body.unset) {
      throw new BadRequest('INVALID_DOC_UPDATE')
    }
    utils.parseOwner(req) //security check
    const { id, set, unset, bucketName = connClass.astenposBucketName, options } = body
    let conditions = ''
    if (set) {conditions += createSetStatement(set)}
    if (unset) {conditions += ` ${createUnsetStatement(unset)}`}
    const statement = `UPDATE ${bucketName} USE KEYS "${id}" ${conditions.trim()} RETURNING meta().id`
    const { ok, results: data, message, err } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {return res.send({ ok, message, err })}
    res.send({ ok, results: data.length ? data[0] : null })
  })
}

export default {
  addRouters,
}
