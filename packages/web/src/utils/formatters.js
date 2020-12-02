import { useState } from 'react'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'

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
