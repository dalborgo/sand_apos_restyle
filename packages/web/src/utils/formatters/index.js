import { useState } from 'react'
import { useIntl } from 'react-intl'
import { translations } from '@adapter/common'
import { messages } from 'src/translations/messages'
import moment from 'moment'
import isDate from 'lodash/isDate'

export function useMoneyFormatter () {
  const intl = useIntl()
  const [moneyFormatter] = useState(() => {
    return (value, currency) =>
      intl.formatNumber(value / 1000, {
        style: 'currency',
        currency: currency ? currency : translations.getLocaleCurrency(intl.locale) || 'EUR',
      })
  })
  return moneyFormatter
}

const defaultDateFormat = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}
const defaultTimeFormat = {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
}

export function useDateFormatter () {
  const intl = useIntl()
  const [dateFormatter] = useState(() => {
    return (date, options) => {
      if (!date) {return ''}
      const date_ = isDate(date) ? date : moment(date, 'YYYYMMDDHHmmssSSS')
      const options_ = Object.assign(defaultDateFormat, options)
      return intl.formatDate(date_, options_)
    }
  })
  return dateFormatter
}

export function useTimeFormatter () {
  const intl = useIntl()
  const [timeFormatter] = useState(() => {
    return (date, options) => {
      if (!date) {return ''}
      const date_ = isDate(date) ? date : moment(date, 'YYYYMMDDHHmmssSSS')
      const options_ = Object.assign(defaultTimeFormat, options)
      return intl.formatTime(date_, options_)
    }
  })
  return timeFormatter
}

export function useDateTimeFormatter () {
  const intl = useIntl()
  const [dateTimeFormatter] = useState(() => {
    return (date, dateOptions, timeOptions) => {
      if (!date) {return ''}
      const date_ = isDate(date) ? date : moment(date, 'YYYYMMDDHHmmssSSS')
      const dateOptions_ = Object.assign(defaultDateFormat, dateOptions)
      const timeOptions_ = Object.assign(defaultTimeFormat, timeOptions)
      return `${intl.formatDate(date_, dateOptions_)} ${intl.formatTime(date_, timeOptions_)}`
    }
  })
  return dateTimeFormatter
}

export function useRoleFormatter () {
  const intl = useIntl()
  const [roleFormatter] = useState(() => {
    return priority => {
      switch (priority) {
        case 4:
          return intl.formatMessage(messages['role_admin'])
        default:
          return intl.formatMessage(messages['role_customer'])
      }
    }
  })
  return roleFormatter
}
