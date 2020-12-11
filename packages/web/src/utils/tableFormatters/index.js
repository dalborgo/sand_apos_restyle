import React from 'react'
import { DataTypeProvider } from '@devexpress/dx-react-grid'
import { FormattedDate, useIntl } from 'react-intl'
import moment from 'moment'
import { translations } from '@adapter/common'

const NumberFormatter = ({ value }) => {
  return value / 1000
}

const MoneyFormatter = ({ value, column }) => {
  const intl = useIntl()
  const { currency } = column
  return intl.formatNumber(value / 1000, {
    style: 'currency',
    currency: currency ? currency : translations.getLocaleCurrency(intl.locale) || 'EUR',
  })
}

const DateFormatter = ({ value }) => {
  const formattedDate = moment(value, 'YYYYMMDDHHmmssSSS')
  return (
    <FormattedDate
      day="2-digit"
      month="short"
      value={formattedDate}
      year="numeric"
    />
  )
}

export const MoneyTypeProvider = props => (
  <DataTypeProvider
    formatterComponent={MoneyFormatter}
    {...props}
  />
)
export const NumberTypeProvider = props => (
  <DataTypeProvider
    formatterComponent={NumberFormatter}
    {...props}
  />
)

export const DateTypeProvider = props => (
  <DataTypeProvider
    formatterComponent={DateFormatter}
    {...props}
  />
)


