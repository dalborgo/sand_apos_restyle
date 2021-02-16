import config from 'config'
import eInvoiceAuth, { authStates } from './eInvoiceClass'
import { createEInvoiceXML } from './utils'
import log from '@adapter/common/src/winston'
import stream from 'stream'

const { security, utils } = require(__helpers)
const qs = require('qs')
const { authenticationBaseUrl, username, password } = config.get('e_invoice')

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
    const base = axios.eInvoiceInstance(authenticationBaseUrl, eInvoiceAuth.accessToken)
    const { data, status } = await base[method](...params)
    partial.data = data
    partial.status = status
    cont++
  } while (partial.status === 401)
  return partial
}

async function userInfo () {
  const partial = await manageRequest(['/auth/userInfo'], 'get')
  return partial.data
}

function addRouters (router) {
  router.get('/e-invoices/signin', async function (req, res) {
    security.hasAuthorization(req.headers)
    res.send(await refresh(getAuth()))
  })
  router.get('/e-invoices/refresh', async function (req, res) {
    const { query } = req
    utils.controlParameters(query, ['refreshToken'])
    const { refreshToken } = query
    res.send(await refresh(refreshToken))
  })
  router.get('/e-invoices/userInfo', async function (req, res) {
    security.hasAuthorization(req.headers)
    res.send(await userInfo())
  })
  router.get('/e-invoices/create_xml', async function (req, res) {
    security.hasAuthorization(req.headers)
    const { connClass, query } = req
    utils.controlParameters(query, ['owner', 'paymentId'])
    const { owner, paymentId } = query
    const {id: eInvoiceId, buf: eInvoiceContent} = await createEInvoiceXML(connClass, owner, paymentId)
    const readStream = new stream.PassThrough()
    readStream.end(eInvoiceContent)
    res.set('Content-disposition', `attachment; filename=${eInvoiceId}.xml`)
    res.set('Content-Type', 'application/xml')
    readStream.pipe(res)
  })
}

export default {
  addRouters,
}
