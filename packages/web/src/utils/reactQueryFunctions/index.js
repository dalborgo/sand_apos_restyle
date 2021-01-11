import axios from 'axios'
import { messages } from 'src/translations/messages'
import { useSnackbar } from 'notistack'
import { useIntl } from 'react-intl'
import { useState } from 'react'
import moment from 'moment'
import { envConfig } from 'src/init'
import { expandError } from 'src/utils/errors'
import log from '@adapter/common/src/log'
import isString from 'lodash/isString'
import mapValues from 'lodash/mapValues'
import qs from 'qs'

export const axiosLocalInstance = axios.create({
  baseURL: `${envConfig.BACKEND_HOST}/api/`,
  paramsSerializer: params => {
    return qs.stringify(mapValues(params, val => val === '' ? undefined : val))
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

export const defaultQueryFn = async ({ queryKey }) => {
  //viene già injectato questo parametro (owner) di default e se viene passato è solo per questioni di chiave della cache
  // eslint-disable-next-line no-unused-vars
  const [_key, { owner, ...params } = {}] = queryKey //passo i parametri come oggetto
  const { data } = await axiosLocalInstance(_key, {
    params,
  })
  return data
}

export function useSnackQueryError () {
  const { enqueueSnackbar } = useSnackbar()
  const intl = useIntl()
  const [snackQueryError] = useState(() => {
    return err => {
      if (isString(err)) {err = { message: err }}
      const { message, isNetworkError, responseData } = expandError(err)
      if (isNetworkError) {
        enqueueSnackbar(intl.formatMessage(messages['network_error']), { variant: 'default' })
      } else if (responseData) {
        const { values, code: errCode } = responseData.err || {}
        const message = messages[responseData.code || errCode]
        enqueueSnackbar(message ? intl.formatMessage(message, values) : responseData.message)
      } else {
        log.debug('error code:', err.code)
        enqueueSnackbar(messages[err.code] ? intl.formatMessage(messages[err.code]) : message)
      }
    }
  })
  return snackQueryError
}

export async function buttonQuery (queryClient, queryKey, setLoading, setIntLoading) {
  if (!queryClient.getQueryData(queryKey)) {
    setLoading(true)
    setIntLoading(true)
    await queryClient.prefetchQuery(queryKey, { throwOnError: true })
    setIntLoading(false)
    setLoading(false)
  }
}
