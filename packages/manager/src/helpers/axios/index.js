import axios from 'axios'
import config from 'config'

const { PORT, NAMESPACE } = config.get('express')
const { SYNC_AUTH_TOKEN } = config.get('couchbase')

const localInstance = axios.create({
  baseURL: `http://127.0.0.1:${PORT}/${NAMESPACE}`,
  headers: { internalcall: 1 },
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || status === 412 //il 412 lo uso come identificativo di una risposta errata
  },
})

const isJsonParsable = data => {
  try {
    return JSON.parse(data)
  } catch (err) {
    return false
  }
}

const restApiInstance = ({ PROTOCOL = 'http', HOST, PORT = 4984 }) => {
  const headers = { 'Content-Type': 'application/json' }
  if (SYNC_AUTH_TOKEN) {headers.Authorization = `Basic ${SYNC_AUTH_TOKEN}`}
  return axios.create({
    baseURL: `${PROTOCOL}://${HOST}:${PORT}`,
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
  localInstance,
  restApiInstance,
}
