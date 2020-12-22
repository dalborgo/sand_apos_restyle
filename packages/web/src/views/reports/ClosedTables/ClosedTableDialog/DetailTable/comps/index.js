import { withStyles } from '@material-ui/core'
import React from 'react'
import Box from '@material-ui/core/Box'
import { TableHeaderRow, VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { IntegratedSummary } from '@devexpress/dx-react-grid'
import { useTimeFormatter } from 'src/utils/formatters'
import { messages } from 'src/translations/messages'
import { useIntl } from 'react-intl'

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

const CellBase = props => {
  const { column, row, theme } = props
  const timeFormatter = useTimeFormatter()
  const intl = useIntl()
  const cellStyle = { paddingLeft: theme.spacing(2) }
  if (column.name === 'date') {
    return (
      <VirtualTable.Cell {...props} style={cellStyle}>
        <Box>
          {timeFormatter(row.date)}
        </Box>
        <Box>
          {row.user}
        </Box>
      </VirtualTable.Cell>
    )
  }
  if (column.name === 'product') {
    return (
      <VirtualTable.Cell {...props} style={cellStyle}>
        <Box>
          {row.intl_code ? intl.formatMessage(messages[row.intl_code]) : row.pro_display}
        </Box>
        <Box>
          {row.cat_display}
        </Box>
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
