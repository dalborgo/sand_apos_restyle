import { withStyles } from '@material-ui/core'
import React, { useMemo } from 'react'
import Box from '@material-ui/core/Box'
import { Table } from '@devexpress/dx-react-grid-material-ui'
import { useTimeFormatter } from 'src/utils/formatters'
import { messages } from 'src/translations/messages'
import { useIntl } from 'react-intl'
import useAuth from 'src/hooks/useAuth'
import { useQueryClient } from 'react-query'
import { useLocation, useParams } from 'react-router'

const CellBase = props => {
  const { column, row, theme, tableRow: { rowId } } = props
  const { selectedCode: { code: owner } } = useAuth()
  const queryClient = useQueryClient()
  const { docId } = useParams()
  const { pathname } = useLocation()
  const isLast = useMemo(() => {
    const urlKey = pathname.replace('/app/', '').replace(`/${docId}`, '').replace('-', '_').slice(0, -1)
    const previousData = queryClient.getQueryData([`${urlKey}/${docId}`, { owner }])
    return rowId + 1 === previousData?.results?.entries?.length
  }, [docId, owner, pathname, queryClient, rowId])
  const timeFormatter = useTimeFormatter()
  const intl = useIntl()
  const cellStyle =
    {
      paddingLeft: theme.spacing(2),
      ...isLast ?
        {
          borderBottomColor: theme.palette.background.paper,
        }
        : {},
    }
  
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
