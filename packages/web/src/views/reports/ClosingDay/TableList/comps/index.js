import { Button, CircularProgress, Typography } from '@material-ui/core'
import React from 'react'
import { FormattedDate, FormattedMessage } from 'react-intl'
import Box from '@material-ui/core/Box'
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { useMoneyFormatter } from 'src/utils/formatters'
import moment from 'moment'
import { useHistory } from 'react-router'

export const LoadingComponent = ({ colSpan, idle, loading }) => {
  return (
    <VirtualTable.Cell colSpan={colSpan}>
      <Box display="flex" justifyContent="center" p={5}>
        {
          loading ?
            <CircularProgress/>
            :
            idle ?
              <Typography><FormattedMessage defaultMessage="Seleziona date!" id="table.select_date"/></Typography>
              :
              <Typography><FormattedMessage defaultMessage="Nessun risultato!" id="table.no_data"/></Typography>
        }
      </Box>
    </VirtualTable.Cell>
  )
}
const baseUrl = '/app/reports/closing-day'
export const Cell = props => {
  const { column, row, value } = props
  const moneyFormatter = useMoneyFormatter()
  const history = useHistory()
  const docId = row._id
  if (column.name === 'income') {
    return (
      <VirtualTable.Cell {...props}  >
        <Box fontWeight="bold">
          {moneyFormatter(row.pu_totale_totale)}
        </Box>
        {
          row.pu_totale_sc > 0 &&
          <Box color="red">
            <FormattedMessage
              defaultMessage="Sconti"
              id="reports.closing_day.discounts"
            />: {moneyFormatter(row.pu_totale_sc)}
          </Box>
        }
        {
          row.pu_totale_st > 0 &&
          <Box color="orange">
            <FormattedMessage
              defaultMessage="Storni"
              id="reports.closing_day.reversal "
            />: {moneyFormatter(row.pu_totale_st)}
          </Box>
        }
      </VirtualTable.Cell>
    )
  }
  if (column.name === 'date') {
    return (
      <VirtualTable.Cell {...props}  >
        <Button color="secondary" onClick={() => history.push(`${baseUrl}/${docId}`)} variant="contained">
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
  return <VirtualTable.Cell {...props} />
}
