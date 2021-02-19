import config from 'config'
import eInvoiceAuth, { authStates } from './eInvoiceClass'
import { createEInvoiceXML } from './utils'
import log from '@adapter/common/src/winston'
import { couchQueries } from '@adapter/io'
import moment from 'moment'
import archiver from 'archiver'

const knex = require('knex')({ client: 'mysql' })
const { utils } = require(__helpers)
const qs = require('qs')
const { authenticationBaseUrl, baseUrl, username, password } = config.get('e_invoice')

const { axios } = require(__helpers)

async function getAuth () {
  const { data } = await axios.eInvoiceInstance(authenticationBaseUrl).post('/auth/signin', qs.stringify({
    grant_type: 'password',
    username,
    password,
  }))
  return data
}

async function refresh (refreshToken) {
  const { data } = await axios.eInvoiceInstance(authenticationBaseUrl).post('/auth/signin', qs.stringify({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  }))
  return data
}

async function manageRequest (params, method = 'post') {
  const { state } = eInvoiceAuth
  log.debug('eInvoiceAuth state:', state)
  switch (state) {
    case authStates.NO_AUTH:
    case authStates.EXPIRED:
      await eInvoiceAuth.setAuth()
      break
    case authStates.REFRESHABLE:
      await eInvoiceAuth.refresh()
      break
    default: // VALID
      break
  }
  const partial = {}
  let cont = 0
  do {
    if (cont) {await eInvoiceAuth.setAuth()}
    const base = axios.eInvoiceInstance(baseUrl, eInvoiceAuth.accessToken)
    const { data, status } = await base[method](...params)
    partial.data = data
    partial.status = status
    cont++
  } while (partial.status === 401)
  return partial
}

async function sendXml (dataFile) {
  const partial = await manageRequest(['/services/invoice/upload', { dataFile }])
  return partial.data
}

async function createXml (req) {
  utils.checkSecurity(req)
  const { connClass, body, params } = req
  const params_ = { ...body, ...params }
  utils.controlParameters(params_, ['owner', 'paymentId'])
  const { owner, paymentId } = params_
  return createEInvoiceXML(connClass, owner, paymentId)
}

function addRouters (router) {
  router.get('/e-invoices/signin', async function (req, res) {
    utils.checkSecurity(req)
    res.send(await refresh(getAuth()))
  })
  router.get('/e-invoices/refresh', async function (req, res) {
    const { query } = req
    utils.controlParameters(query, ['refreshToken'])
    const { refreshToken } = query
    res.send(await refresh(refreshToken))
  })
  router.post('/e-invoices/create_xml/:paymentId', async function (req, res) {
    const { id: eInvoiceId, buffer: eInvoiceContent } = await createXml(req)
    res.send({ filename: `${eInvoiceId}.xml`, base64: eInvoiceContent.toString('base64') })
  })
  router.post('/e-invoices/send_xml/:paymentId', async function (req, res) {
    const { buffer: eInvoiceContent } = await createXml(req)
    const dataFile = eInvoiceContent.toString('base64')
    res.send(await sendXml(dataFile))
  })
  router.post('/e-invoices/create_zip', async function (req, res) {
    const { connClass, body } = req
    utils.controlParameters(body, ['startDateInMillis', 'endDateInMillis', 'owner'])
    const parsedOwner = utils.parseOwner(req, 'buc')
    const {
      owner,
      bucketName = connClass.astenposBucketName,
      options,
      startDateInMillis: startDate,
      endDateInMillis: endDate,
    } = body
    const endDate_ = moment(endDate, 'YYYYMMDDHHmmssSSS').endOf('day').format('YYYYMMDDHHmmssSSS') // end day
    const statement = knex({ buc: bucketName })
      .select(knex.raw('buc.*, mode.payment_mode'))
      .joinRaw(`LEFT JOIN \`${bucketName}\` mode ON KEYS buc.income_id`)
      .where({ 'buc.type': 'PAYMENT' })
      .where({ 'buc.mode': 'INVOICE' })
      .where({ 'buc.archived': true })
      .whereBetween('buc.date', [startDate, endDate_])
      .where(knex.raw(parsedOwner.queryCondition))
      .toQuery()
    const { ok, results, message, err } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {
      res.status(412).send({ ok, message, err })
    }
    const zip = archiver('zip', {})
    zip.pipe(res)
    for (let payment of results) {
      const { id: eInvoiceId, buffer: eInvoiceContent } = await createEInvoiceXML(connClass, owner, payment)
      zip.append(eInvoiceContent, { name: `${eInvoiceId}.xml` })
    }
    await zip.finalize()
  })
}

export default {
  addRouters,
}
