import { useState } from 'react'
import { useIntl } from 'react-intl'
import { translations } from '@adapter/common'
import { messages } from 'src/translations/messages'
import moment from 'moment'
import isDate from 'lodash/isDate'
import isNumber from 'lodash/isNumber'
import numberToLetter from 'number-to-letter'

export function useMoneyFormatter () {
  const intl = useIntl()
  const [moneyFormatter] = useState(() => {
    return (value, currency) =>
      intl.formatNumber(value / 1000 || 0, {
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
      const dateConv = isNumber(date) ? String(Math.abs(date)) : date
      const date_ = isDate(dateConv) ? dateConv : moment(dateConv, 'YYYYMMDDHHmmssSSS')
      const options_ = { ...defaultDateFormat, ...options }
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
      const dateConv = isNumber(date) ? String(Math.abs(date)) : date
      const date_ = isDate(dateConv) ? dateConv : moment(dateConv, 'YYYYMMDDHHmmssSSS')
      const options_ = { ...defaultTimeFormat, ...options }
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
      const dateConv = isNumber(date) ? String(Math.abs(date)) : date
      const date_ = isDate(dateConv) ? dateConv : moment(dateConv, 'YYYYMMDDHHmmssSSS')
      const dateOptions_ = { ...defaultDateFormat, ...dateOptions }
      const timeOptions_ = { ...defaultTimeFormat, ...timeOptions }
      return `${intl.formatDate(date_, dateOptions_)} ${intl.formatTime(date_, timeOptions_)}`
    }
  })
  return dateTimeFormatter
}

export function ctol (columns) {
  const output = {}
  let count = 0
  for (let column of columns) {
    const idCol = count++
    output[column.key] = numberToLetter(idCol)
  }
  return output
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
