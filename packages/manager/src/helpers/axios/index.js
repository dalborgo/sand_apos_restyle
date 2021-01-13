import axios from 'axios'
import config from 'config'

const { PORT, NAMESPACE } = config.get('express')
const { SYNC_AUTH_TOKEN = '' } = config.get('couchbase')

const localInstance = axios.create({
  baseURL: `http://127.0.0.1:${PORT}/${NAMESPACE}`,
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || status === 412 //il 412 lo uso come identificativo di una risposta errata
  },
})

const restApiInstance = ({ PROTOCOL = 'http', HOST, PORT = 4984 }) => axios.create({
  baseURL: `${PROTOCOL}://${HOST}:${PORT}`,
  headers: {
    Authorization: `Basic ${SYNC_AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  },
  validateStatus: function (status) {
    return (status >= 200 && status < 300)
  },
  transformResponse: function (data) {
    return { ok: true, results: JSON.parse(data) }
  },
})

export default {
  localInstance,
  restApiInstance,
}
