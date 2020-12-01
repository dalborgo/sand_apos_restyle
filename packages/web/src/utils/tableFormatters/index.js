import React from 'react'
import { DataTypeProvider } from '@devexpress/dx-react-grid'
import { FormattedDate } from 'react-intl'
import moment from 'moment'

const NumberFormatter = ({ value }) => {
  return value / 1000
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


