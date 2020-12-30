import { withStyles } from '@material-ui/core'
import React from 'react'
import Box from '@material-ui/core/Box'
import { Table } from '@devexpress/dx-react-grid-material-ui'
import { useTimeFormatter } from 'src/utils/formatters'
import { messages } from 'src/translations/messages'
import { useIntl } from 'react-intl'

const CellBase = props => {
  const { column, row, theme } = props
  const timeFormatter = useTimeFormatter()
  const intl = useIntl()
  const cellStyle = { paddingLeft: theme.spacing(2) }
  if (column.name === 'date') {
    return (
      <Table.Cell {...props} style={cellStyle}>
        <Box>
          {timeFormatter(row.date)}
        </Box>
        <Box>
          {row.user}
        </Box>
      </Table.Cell>
    )
  }
  if (column.name === 'product') {
    return (
      <Table.Cell {...props} style={cellStyle}>
        <Box>
          {row.intl_code ? intl.formatMessage(messages[row.intl_code]) : row.pro_display}
        </Box>
        <Box>
          {row.cat_display}
        </Box>
      </Table.Cell>
    )
  }
  return <Table.Cell {...props} style={cellStyle}/>
}

const styles = theme => ({
  cell: {
    padding: theme.spacing(1, 2),
  },
})

export const Cell = withStyles(styles, { withTheme: true })(
  CellBase
)
