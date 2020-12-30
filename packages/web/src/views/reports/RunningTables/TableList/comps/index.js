import { Button, makeStyles, withStyles } from '@material-ui/core'
import React, { useState } from 'react'
import Box from '@material-ui/core/Box'
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { useDateTimeFormatter } from 'src/utils/formatters'
import { useHistory } from 'react-router'
import { useQueryClient } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import { useGeneralStore } from 'src/zustandStore'
import { buttonQuery } from 'src/utils/reactQueryFunctions'
import shallow from 'zustand/shallow'
import parse from 'html-react-parser'

const loadingSel = state => ({ setLoading: state.setLoading, loading: state.loading })

const useStyles = makeStyles(() => ({
  buttonRoot: {
    textTransform: 'none',
    lineHeight: '18px',
    textAlign: 'left',
  },
}))

const CellBase = props => {
  const { column, row, theme } = props
  const dateTimeFormatter = useDateTimeFormatter()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const [intLoading, setIntLoading] = useState(false)
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const history = useHistory()
  const queryClient = useQueryClient()
  const docId = row._id
  const cellStyle = { paddingLeft: theme.spacing(2) }
  const user = row.user || ''
  if (column.name === 'last_saved_date') {
    return (
      <VirtualTable.Cell {...props} style={cellStyle}>
        <Button
          classes={
            {
              root: classes.buttonRoot,
            }
          }
          disabled={intLoading}
          onClick={
            async () => {
              const queryKey = [`reports/running_table/${docId}`, { owner }]
              await buttonQuery(queryClient, queryKey, setLoading, setIntLoading)
              history.push(`${window.location.pathname}/${docId}`)
            }
          }
          size="small"
          variant="contained"
        >
          {
            parse(dateTimeFormatter(row.last_saved_date, {
              year: undefined,
              month: 'short',
            }, { second: undefined }) + '<br/>' + user)
          }
        </Button>
      </VirtualTable.Cell>
    )
  }
  if (column.name === 'table_display') {
    return (
      <VirtualTable.Cell {...props} style={cellStyle}>
        <Box>
          {row.table_display}
        </Box>
        <Box>
          {row.room_display}
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
