import { Button, ButtonGroup, colors, makeStyles, withStyles } from '@material-ui/core'
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
import { messages } from 'src/translations/messages'
import { FormattedMessage, useIntl } from 'react-intl'
import clsx from 'clsx'

export const summaryCalculator = (type, rows, getValue) => {
  if (type === 'incomeSum') {
    return rows.reduce((prev, curr) => {
      prev.tot += curr.final_price
      prev.sc += curr.discount_price
      return prev
    }, { tot: 0, sc: 0 })
  } else {
    return IntegratedSummary.defaultCalculator(type, rows, getValue)
  }
}

const loadingSel = state => ({ setLoading: state.setLoading, loading: state.loading })

const useStyles = makeStyles(theme => ({
  buttonRoot: {
    textTransform: 'none',
    lineHeight: '18px',
    textAlign: 'left',
  },
  printIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  buttonGrouped: {
    padding: theme.spacing(0, 0.5),
  },
  buttonGreen: {
    backgroundColor: colors.green[100],
    '&:hover': {
      backgroundColor: colors.green[200],
    },
  },
  buttonCyan: {
    backgroundColor: colors.cyan[100],
    '&:hover': {
      backgroundColor: colors.cyan[200],
    },
  },
  buttonPink: {
    backgroundColor: colors.red[100],
    '&:hover': {
      backgroundColor: colors.red[200],
    },
  },
}))

export const SummaryCellBase = props => {
  const { column, children } = props
  const moneyFormatter = useMoneyFormatter()
  if (column.name === 'final_price') {
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
      </VirtualTable.Cell>
    )
  } else {
    return <VirtualTable.Cell {...props}/>
  }
}

const CellBase = props => {
  const { column, row, theme } = props
  const intl = useIntl()
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
  const { payments } = row
  if (column.name === 'date') {
    const closedBy = column.getCellValue(row)
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
            }, { second: undefined }) + '<br/>' + closedBy)
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
  if (column.name === 'type') {
    return (
      <VirtualTable.Cell {...props} style={cellStyle}>
        {
          Array.isArray(payments) ?
            <Box>
              separato
            </Box>
            :
            <>
              <Box mb={0.5}>
                {intl.formatMessage(messages[`mode_${payments.mode}`])}
              </Box>
              <ButtonGroup disableFocusRipple size="small" variant="contained">
                <Button
                  className={clsx(classes.buttonGrouped, classes.buttonGreen)}
                  onClick={
                    async () => {
                      const queryKey = ['types/incomes', { owner }]
                      if (!queryClient.getQueryData(queryKey)) {
                        setLoading(true)
                        setIntLoading(true)
                        await queryClient.prefetchQuery(queryKey, { throwOnError: true })
                        setIntLoading(false)
                        setLoading(false)
                      }
                      history.push({
                        pathname: `${window.location.pathname}/change-payment-method/${docId}`,
                        income: payments.income,
                      })
                    }
                  }
                >
                  {payments.income}
                </Button>
              </ButtonGroup>
            </>
        }
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
          <Box color="red">
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

export const CellSummary = withStyles(styles, { withTheme: true })(
  SummaryCellBase
)
