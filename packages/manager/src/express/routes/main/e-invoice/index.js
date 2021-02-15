import config from 'config'
import get from 'lodash/get'
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

async function manageRequest (authData, params, method = 'post') {
  const accessToken = authData ? authData.access_token : get(await getAuth(),'results.access_token')
  const partial = {}
  do {
    const base = axios.eInvoiceInstance(authenticationBaseUrl, accessToken)
    const { data, status } = await base[method](...params)
    partial.data = data
    partial.status = status
  } while(partial.status === 401)
  return partial
}

async function userInfo (authData) {
  const partial = await manageRequest(authData, ['/auth/userInfo'], 'get')
  return partial.data
}

function addRouters (router) {
  router.get('/e-invoice/signin', async function (req, res) {
    security.hasAuthorization(req.headers)
    res.send(await refresh(getAuth()))
  })
  router.get('/e-invoice/refresh', async function (req, res) {
    const { query } = req
    utils.controlParameters(query, ['refreshToken'])
    const { refreshToken } = query
    res.send(await refresh(refreshToken))
  })
  router.get('/e-invoice/userInfo', async function (req, res) {
    security.hasAuthorization(req.headers)
    res.send(await userInfo())
  })
}

export default {
  addRouters,
}
