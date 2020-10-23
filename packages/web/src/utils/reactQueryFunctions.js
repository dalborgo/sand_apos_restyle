import axios from 'axios'

export const axiosLocalInstance = axios.create({
  baseURL: 'http://127.0.0.1:7000',
  params: {
    _key: 'astenposServer',
  },
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || status === 412 //il 412 lo uso come identificativo di una risposta errata
  },
})
