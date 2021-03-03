import axios from 'axios'
import config from 'config'

const { PORT, NAMESPACE } = config.get('express')
const { baseURL: DEFAULT_BASE_URL } = config.get('e_invoice')
const { connections } = config.get('couchbase')
const { server: HOST_DEFAULT } = connections['astenposServer']

const DEFAULT_REST_BASE_URL = `http://${HOST_DEFAULT}:4985`

const localInstance = axios.create({
  baseURL: `http://127.0.0.1:${PORT}/${NAMESPACE}`,
  headers: { internalcall: 1 },
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || status === 412 //il 412 lo uso come identificativo di una risposta errata
  },
})
const getHotelInstance = async conf => {
  const {
    headers,
    hotelServer,
    port,
    protocol,
  } = conf
  return axios.create({
    baseURL: `${protocol}://${hotelServer}${port ? `:${port}` : ''}`,
    headers,
    validateStatus: function (status) {
      return (status >= 200 && status < 300) || status === 412 //il 412 lo uso come identificativo di una risposta errata
    },
  })
}

const isJsonParsable = data => {
  try {
    return JSON.parse(data)
  } catch (err) {
    return false
  }
}

const eInvoiceInstance = (baseURL = DEFAULT_BASE_URL, token, headers_ = {}) => {
  const defaultHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
  }
  const headers = Object.assign(defaultHeaders, headers_)
  if (token) {headers.Authorization = `Bearer ${token}`}
  return axios.create({
    baseURL,
    headers,
    validateStatus: function (status) {
      return (status >= 200 && status < 500)
    },
    transformResponse: function (data) {
      const results = isJsonParsable(data) || data
      return !results || results.error ? { ok: false, results, errCode: results.error || 'invalid_token' } : { ok: true, results }
    },
  })
}
const restApiInstance = (baseURL = DEFAULT_REST_BASE_URL, token) => {
  const headers = { 'Content-Type': 'application/json' }
  if (token) {headers.Authorization = `Basic ${token}`}
  return axios.create({
    baseURL,
    headers,
    validateStatus: function (status) {
      return (status >= 200 && status < 300)
    },
    transformResponse: function (data) {
      return { ok: true, results: isJsonParsable(data) || data }
    },
  })
}

export default {
  eInvoiceInstance,
  getHotelInstance,
  localInstance,
  restApiInstance,
}
