import { Button, makeStyles, withStyles } from '@material-ui/core'
import React, { useState } from 'react'
import Box from '@material-ui/core/Box'
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { IntegratedSummary } from '@devexpress/dx-react-grid'
import { useDateTimeFormatter, useMoneyFormatter } from 'src/utils/formatters'
import { useHistory } from 'react-router'
import { useQueryClient } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import { useGeneralStore } from 'src/zustandStore'
import shallow from 'zustand/shallow'
import parse from 'html-react-parser'

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
  const moneyFormatter = useMoneyFormatter()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const [intLoading, setIntLoading] = useState(false)
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const history = useHistory()
  const queryClient = useQueryClient()
  const docId = row._id
  const cellStyle = { paddingLeft: theme.spacing(2) }
  if (column.name === 'date') {
    return (
      <VirtualTable.Cell {...props}>
        <Button
          classes={
            {
              root: classes.buttonRoot,
            }
          }
          disabled={intLoading}
          onClick={
            async () => {
              const queryKey = [`reports/closed_table/${docId}`, { owner }]
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
          variant="contained"
        >
          {
            parse(dateTimeFormatter(row.date, {
              year: undefined,
              month: 'short',
            }, { second: undefined }) + '<br/>' + row.user)
          }
        </Button>
      </VirtualTable.Cell>
    )
  }
  if (column.name === 'mode') {
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
  if (column.name === 'final_price') {
    return (
      <VirtualTable.Cell {...props} style={cellStyle}>
        <Box>
          {moneyFormatter(row.final_price)}
        </Box>
        {
          Boolean(row.discount_price) &&
          <Box>
            -{moneyFormatter(row.discount_price)}
          </Box>
        }
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

