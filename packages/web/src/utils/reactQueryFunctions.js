import axios from 'axios'
import { messages } from 'src/translations/messages'
import { useSnackbar } from 'notistack'
import { useIntl } from 'react-intl'
import { useState } from 'react'
import log from '@adapter/common/src/log'

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
