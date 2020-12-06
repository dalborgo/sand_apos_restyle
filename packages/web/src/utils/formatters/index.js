import { useState } from 'react'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import moment from 'moment'
import isDate from 'lodash/isDate'

const defaultCurrency = {
  it: 'EUR',
}

export function useMoneyFormatter () {
  const intl = useIntl()
  const [moneyFormatter] = useState(() => {
    return (value, currency) =>
      intl.formatNumber(value / 1000, {
        style: 'currency',
        currency: currency ? currency : defaultCurrency[intl.locale] || 'EUR',
      })
  })
  return moneyFormatter
}

const defaultDateFormat = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}

export function useDateFormatter () {
  const intl = useIntl()
  const [dateFormatter] = useState(() => {
    return (date, options) => {
      let date_ = date
      if (!isDate(date)) {date_ = moment(date_, 'YYYYMMDDHHmmssSSS')}
      const options_ = Object.assign(defaultDateFormat, options)
      return intl.formatDate(date_, options_)
    }
  })
  return dateFormatter
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
