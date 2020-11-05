import axios from 'axios'
import { messages } from 'src/translations/messages'
import { useSnackbar } from 'notistack'
import { useIntl } from 'react-intl'
import { useState } from 'react'
import log from '@adapter/common/src/log'
import moment from 'moment'

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

axiosLocalInstance.interceptors.request.use(function (config) {
  config.timeData = { start: moment().toISOString() }
  return config
}, function (error) {
  return Promise.reject(error)
})
axiosLocalInstance.interceptors.response.use(function (response) {
  response.config['timeData'].duration = moment.duration(moment().diff(moment(response.config['timeData'].start)))
  return response
}, function (error) {
  return Promise.reject(error)
})

export const defaultQueryFn = async (key, params) => {
  const { data, config } = await axiosLocalInstance(`/api/${key}`, {
    params,
  })
  return { ...data, durationInMilli: config?.timeData?.duration.milliseconds }
}

export function useSnackQueryError () {
  const { enqueueSnackbar } = useSnackbar()
  const intl = useIntl()
  const [snackQueryError] = useState(() => {
    return err => {
      const { message, response = {}, request: { status } } = err
      log.error(message)
      const { data: responseData } = response
      const isNetworkError = status === 0
      if (responseData) {
        enqueueSnackbar(responseData.message || intl.formatMessage(messages[responseData.messageCode]))
      } else if (isNetworkError) {
        enqueueSnackbar(intl.formatMessage(messages['network_error']), { variant: 'default' })
      } else {
        enqueueSnackbar(message)
      }
    }
  })
  return snackQueryError
}
