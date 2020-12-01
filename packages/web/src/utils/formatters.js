import { useState } from 'react'
import { useIntl } from 'react-intl'

const defaultCurrency = {
  it: 'EUR',
}

export function useMoneyFormatter () {
  const intl = useIntl()
  const [moneyFormatter] = useState(() => {
    return (value, currency) =>
      intl.formatNumber(value / 1000, {
        style: 'currency',
        currency: currency ? currency : defaultCurrency[intl.locale]
      })
  })
  return moneyFormatter
}
