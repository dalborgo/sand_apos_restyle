import { Button, withStyles } from '@material-ui/core'
import React, { useState } from 'react'
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl'
import Box from '@material-ui/core/Box'
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { IntegratedSummary } from '@devexpress/dx-react-grid'
import { useMoneyFormatter } from 'src/utils/formatters'
import moment from 'moment'
import { useHistory } from 'react-router'
import { useQueryClient } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import { useGeneralStore } from 'src/zustandStore'
import shallow from 'zustand/shallow'
import { messages } from 'src/translations/messages'

export const summaryCalculator = (type, rows, getValue) => {
  if (type === 'incomeSum') {
    return rows.reduce((prev, curr) => {
      prev.tot += curr.pu_totale_totale || 0
      prev.sc += curr.pu_totale_sc || 0
      prev.st += curr.pu_totale_st || 0
      return prev
    }, { tot: 0, sc: 0, st: 0 })
  } else {
    return IntegratedSummary.defaultCalculator(type, rows, getValue)
  }
}
export const SummaryCellBase = props => {
  const { column, children } = props
  const moneyFormatter = useMoneyFormatter()
  if (column.name === 'income') {
    const { columnSummaries } = children.props || {}
    const [first] = columnSummaries
    return (
      <VirtualTable.Cell {...props}>
        <Box color="text.primary" fontWeight="bold">
          <FormattedMessage
            defaultMessage="Totale"
            id="reports.total"
          />: {moneyFormatter(first.value.tot)}
        </Box>
        {
          first.value.sc > 0 &&
          <Box color="red">
            <FormattedMessage
              defaultMessage="Totale Sconti"
              id="reports.tot_discount"
            />: {moneyFormatter(first.value.sc)}
          </Box>
        }
        {
          first.value.st > 0 &&
          <Box color="orange">
            <FormattedMessage
              defaultMessage="Totale Storni"
              id="reports.closing_day.tot_reversal "
            />: {moneyFormatter(first.value.st)}
          </Box>
        }
      </VirtualTable.Cell>
    )
  } else {
    return <VirtualTable.Cell {...props}/>
  }
}

const loadingSel = state => ({ setLoading: state.setLoading, loading: state.loading })

const CellBase = props => {
  const { column, row, value, theme } = props
  const moneyFormatter = useMoneyFormatter()
  const intl = useIntl()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const [intLoading, setIntLoading] = useState(false)
  const { selectedCode: { code: owner } } = useAuth()
  const history = useHistory()
  const queryClient = useQueryClient()
  const docId = row._id
  const cellStyle = { paddingLeft: theme.spacing(2) }
  if (column.name === 'income') {
    return (
      <VirtualTable.Cell {...props}>
        <Box fontWeight="bold">
          {moneyFormatter(row.pu_totale_totale)}
        </Box>
        {
          row.pu_totale_sc > 0 &&
          <Box color="red">
            {intl.formatMessage(messages['common_discounts'])}: {moneyFormatter(row.pu_totale_sc)}
          </Box>
        }
        {
          row.pu_totale_st > 0 &&
          <Box color="orange">
            {intl.formatMessage(messages['common_reversals'])}: {moneyFormatter(row.pu_totale_st)}
          </Box>
        }
      </VirtualTable.Cell>
    )
  }
  if (column.name === 'date') {
    return (
      <VirtualTable.Cell {...props} style={cellStyle}>
        <Button
          disabled={intLoading}
          onClick={
            async () => {
              const queryKey = ['queries/query_by_id', { id: docId, owner }]
              if (!queryClient.getQueryData(queryKey)) {
                setLoading(true)
                setIntLoading(true)
                await queryClient.prefetchQuery(queryKey, { throwOnError: true })
                setIntLoading(false)
                setLoading(false)
              }
              history.push(`${window.location.pathname}/${docId}`)
            }
          }
          size="small"
          style={{ textTransform: 'none' }}
          variant="contained"
        >
          <FormattedDate
            day="2-digit"
            month="short"
            value={moment(value, 'YYYYMMDDHHmmssSSS')}
            weekday="short"
            year="numeric"
          />
        </Button>
      </VirtualTable.Cell>
    )
  }
  return <VirtualTable.Cell {...props} style={cellStyle}/>
}

const styles = theme => ({
  cell: {
    padding: theme.spacing(1, 2),
  },
})

export const Cell = withStyles(styles, { withTheme: true })(
  CellBase
)
export const CellSummary = withStyles(styles, { withTheme: true })(
  SummaryCellBase
)
