import axios from 'axios'
import { messages } from 'src/translations/messages'
import { useSnackbar } from 'notistack'
import { useIntl } from 'react-intl'
import { useState } from 'react'
import moment from 'moment'
import { envConfig } from 'src/init'
import qs from 'qs'
import { expandError } from './errors'
import log from '@adapter/common/src/log'

export const axiosLocalInstance = axios.create({
  baseURL: envConfig.BACKEND_HOST,
  params: {
    _key: 'astenposServer',
  },
  paramsSerializer: params => {
    return qs.stringify(params)
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
  const duration = moment.duration(moment().diff(moment(response.config['timeData'].start)))
  response.config['timeData'].responseTimeInMilli = duration.asMilliseconds()
  return response
}, function (error) {
  return Promise.reject(error)
})

export const defaultQueryFn = async (key, params_) => {
  //viene già injectato questo parametro (owner) di default e se viene passato è solo per questioni di chiave della cache
  const { owner, ...params } = params_ || {}
  const { data } = await axiosLocalInstance(`/api/${key}`, {
    params,
  })
  return data
}

export function useSnackQueryError () {
  const { enqueueSnackbar } = useSnackbar()
  const intl = useIntl()
  const [snackQueryError] = useState(() => {
    return err => {
      const { message, isNetworkError, responseData } = expandError(err)
      if (isNetworkError) {
        enqueueSnackbar(intl.formatMessage(messages['network_error']), { variant: 'default' })
      } else if (responseData) {
        enqueueSnackbar(responseData.message || intl.formatMessage(messages[responseData.code]))
      } else {
        log.debug('error code:', err.code)
        enqueueSnackbar(messages[err.code] ? intl.formatMessage(messages[err.code]) : message)
      }
    }
  })
  return snackQueryError
}
