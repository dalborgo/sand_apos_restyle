import { Button, Typography, withStyles } from '@material-ui/core'
import React, { memo, useState } from 'react'
import { FormattedDate, FormattedMessage } from 'react-intl'
import Box from '@material-ui/core/Box'
import { TableHeaderRow, VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { IntegratedSummary } from '@devexpress/dx-react-grid'
import { useDateTimeFormatter } from 'src/utils/formatters'
import moment from 'moment'
import { useHistory } from 'react-router'
import { useQueryCache } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import { useGeneralStore } from 'src/zustandStore'
import shallow from 'zustand/shallow'

export const LoadingComponent = memo(function LoadingComponent ({ isFetching, ...rest }) {
  return (
    <VirtualTable.Cell {...rest} style={{ border: 'none' }}>
      <Box display="flex" justifyContent="center" p={5}>
        {
          isFetching ?
            <Typography><FormattedMessage defaultMessage="Caricamento..." id="common.loading"/></Typography>
            :
            <Typography><FormattedMessage defaultMessage="Nessun risultato!" id="table.no_data"/></Typography>
        }
      </Box>
    </VirtualTable.Cell>
  )
})

export const summaryCalculator = (type, rows, getValue) => {
  if (type === 'incomeSum') {
    return rows.reduce((prev, curr) => {
      prev.tot += curr.pu_totale_totale
      prev.sc += curr.pu_totale_sc
      prev.st += curr.pu_totale_st
      return prev
    }, { tot: 0, sc: 0, st: 0 })
  } else {
    return IntegratedSummary.defaultCalculator(type, rows, getValue)
  }
}
export const SummaryCellBase = props => {
  return <VirtualTable.Cell {...props}/>
}

const loadingSel = state => ({ setLoading: state.setLoading, loading: state.loading })

const CellBase = props => {
  const { column, row, value, theme } = props
  const dateTimeFormatter = useDateTimeFormatter()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const [intLoading, setIntLoading] = useState(false)
  const { selectedCode: { code: owner } } = useAuth()
  const history = useHistory()
  const queryCache = useQueryCache()
  const docId = row._id
  const cellStyle = { paddingLeft: theme.spacing(2) }
  if (column.name === 'creation_date') {
    return (
      <VirtualTable.Cell {...props}>
        <Box>
          {dateTimeFormatter(row.creation_date, { year: undefined })}
        </Box>
        {/* {
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
        }*/}
      </VirtualTable.Cell>
    )
  }
  if (column.name === 'date') {
    return (
      <VirtualTable.Cell {...props} style={cellStyle}>
        <Button
          color="secondary"
          disabled={intLoading}
          onClick={
            async () => {
              const queryKey = ['queries/query_by_id', { id: docId, owner }]
              if (!queryCache.getQueryData(queryKey)) {
                setLoading(true)
                setIntLoading(true)
                await queryCache.prefetchQuery(queryKey, { throwOnError: true })
                setIntLoading(false)
                setLoading(false)
              }
              history.push(`${window.location.pathname}/${docId}`)
            }
          }
          variant="contained"
        >
          <FormattedDate
            day="2-digit"
            month="short"
            value={moment(value, 'YYYYMMDDHHmmssSSS')}
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
//c'era un warning sul campo children mancante
export const CellHeader = withStyles(styles, { withTheme: true })(
  ({ classes, theme, children, ...rest }) => (
    <TableHeaderRow.Cell
      {...rest}
      children={children}
      className={classes.cell}
      style={{ paddingLeft: theme.spacing(2) }}
    />
  )
)
