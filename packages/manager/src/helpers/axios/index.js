import axios from 'axios'
import config from 'config'

const { PORT, NAMESPACE } = config.get('express')

const localInstance = axios.create({
  baseURL: `http://127.0.0.1:${PORT}/${NAMESPACE}`,
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || status === 412 //il 412 lo uso come identificativo di una risposta errata
  },
})

const restApiInstance = HOST => axios.create({
  baseURL: `http://${HOST}:4985`,
  validateStatus: function (status) {
    return (status >= 200 && status < 300)
  },
})

export default {
  localInstance,
  restApiInstance,
}
