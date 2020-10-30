import axios from 'axios'
const wlh = window.location.hostname
export const axiosLocalInstance = axios.create({
  baseURL: `http://${wlh}:7000`,
  params: {
    _key: 'astenposServer',
  },
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || status === 412 //il 412 lo uso come identificativo di una risposta errata
  },
})

export const defaultQueryFn = async (key, params) => {
  const { data } = await axiosLocalInstance(`/api/${key}`, {
    params,
  })
  return data
}
