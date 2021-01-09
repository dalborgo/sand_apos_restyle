import React, { useCallback, useState } from 'react'
import { Box, Button, ButtonGroup, colors, makeStyles, withStyles } from '@material-ui/core'
import { Grid, Table, TableHeaderRow } from '@devexpress/dx-react-grid-material-ui'
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
import { buttonQuery } from 'src/utils/reactQueryFunctions'
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
      <Table.Cell {...props}>
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
      </Table.Cell>
    )
  } else {
    return <Table.Cell {...props}/>
  }
}

const TypeButtonGroup = ({ payments, setIntLoading, base }) => {
  const classes = useStyles()
  const history = useHistory()
  const { selectedCode: { code: owner } } = useAuth()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const queryClient = useQueryClient()
  return (
    <ButtonGroup disableFocusRipple size="small" variant="contained">
      <Button
        className={clsx(classes.buttonGrouped, classes.buttonGreen)}
        onClick={
          async () => {
            const queryKey = ['types/incomes', { owner }]
            await buttonQuery(queryClient, queryKey, setLoading, setIntLoading)
            history.push({
              pathname: `${window.location.pathname}/change-payment-method/${payments._id}`,
              state: {
                income: payments.income,
                table: base.table_display,
                room: base.room_display,
                date: base.date,
                amount: base.final_price,
              },
            })
          }
        }
      >
        {payments.income}
      </Button>
    </ButtonGroup>
  )
}

const CellBase = props => {
  const { column, row, theme, tableRow: {rowId} } = props
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
  const cellStyle = { paddingLeft: theme.spacing(2), overflow: 'auto' }
  const { payments } = row
  if (column.name === '_date') {
    return (
      <Table.Cell {...props} style={cellStyle}>
        {
          dateTimeFormatter(row._date, {
            year: undefined,
            month: 'short',
          }, { second: undefined })
        }
      </Table.Cell>
    )
  }
  if (column.name === 'date') {
    const { closed_by: closedBy } = Array.isArray(payments) ? payments[0] : payments
    return (
      <Table.Cell {...props}>
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
              await buttonQuery(queryClient, queryKey, setLoading, setIntLoading)
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
      </Table.Cell>
    )
  }
  if (column.name === 'table_display') {
    return (
      <Table.Cell {...props} style={cellStyle}>
        <Box>
          {row.table_display}
        </Box>
        <Box>
          {row.room_display}
        </Box>
      </Table.Cell>
    )
  }
  if (column.name === 'type') {
    return (
      <Table.Cell {...props} style={cellStyle}>
        {
          Array.isArray(payments) ?
            <Box>
              <Button
                className={classes.buttonGrouped}
                onClick={
                  () => {
                    const elem = document.getElementById(`expand${row._id}`)
                    elem && elem.click()
                  }
                }
                size="small"
                variant="contained"
              >
                {intl.formatMessage(messages['common_dividedPayment'])}
              </Button>
            </Box>
            :
            <>
              <Box mb={0.5}>
                {messages[`mode_${payments.mode}`] ? intl.formatMessage(messages[`mode_${payments.mode}`]) : payments.mode}{payments.number ? ` ${payments.number}` : ''}
              </Box>
              <TypeButtonGroup base={row} payments={payments} setIntLoading={setIntLoading}/>
            </>
        }
      </Table.Cell>
    )
  }
  if (column.name === 'type_detail') {
    // eslint-disable-next-line camelcase
    const [room_display, table_display] = rowId.split('|')
    return (
      <Table.Cell {...props} style={cellStyle}>
        {
          <Box display="flex">
            <Box mr={1}>
              {messages[`mode_${row.mode}`] ? intl.formatMessage(messages[`mode_${row.mode}`]) : row.mode}
            </Box>
            <Box>
              <TypeButtonGroup base={{room_display, table_display, date: row._date, final_price: row.final_price}} payments={row} setIntLoading={setIntLoading}/>
            </Box>
          </Box>
        }
      </Table.Cell>
    )
  }
  if (column.name === 'final_price') {
    return (
      <Table.Cell {...props} style={cellStyle}>
        <Box>
          {moneyFormatter(row.final_price)}
        </Box>
        {
          Boolean(row.discount_price) &&
          <Box color="red">
            -{moneyFormatter(row.discount_price)}
          </Box>
        }
      </Table.Cell>
    )
  }
  return <Table.Cell {...props} style={cellStyle}/>
}

const styleCell = theme => ({
  cell: {
    padding: theme.spacing(1, 2),
  },
})

export const Cell = withStyles(styleCell, { withTheme: true })(CellBase)

export const CellSummary = withStyles(styleCell, { withTheme: true })(SummaryCellBase)

//region DETAIL COMPONENT
const styleDetailCell = theme => ({
  cell: {
    padding: theme.spacing(1, 2),
    border: 0,
  },
})

export const InternalDetailCell = withStyles(styleDetailCell, { withTheme: true })(CellBase)

const DetailRowHeader = withStyles(styleDetailCell, { withTheme: true })(
  ({ theme, children, ...rest }) => (
    <TableHeaderRow.Cell
      {...rest}
      children={children}
      style={{ paddingLeft: theme.spacing(2) }} //la prima cella prendeva un valore più forte
    />
  )
)

const tableDetailColumnExtensions = [
  { columnName: 'covers', align: 'right' },
  { columnName: 'final_price', align: 'right' },
]

export const GridDetailContainerBase = ({ row }) => {
  const getRowId = useCallback(row_ => {
    return `${row.room_display}|${row.table_display}|${row_._id}`
  },[row.room_display, row.table_display])
  const intl = useIntl()
  const [detailColumns] = useState([
    { name: '_date', title: intl.formatMessage(messages['common_date']) },
    { name: 'closed_by', title: intl.formatMessage(messages['common_closedBy']) },
    { name: 'type_detail', title: intl.formatMessage(messages['common_type']) },
    { name: 'covers', title: intl.formatMessage(messages['common_covers']) },
    { name: 'final_price', title: intl.formatMessage(messages['common_cashed']) },
  ])
  return (
    <Grid
      columns={detailColumns}
      getRowId={getRowId}
      rows={row.payments}
    >
      <Table
        cellComponent={InternalDetailCell}
        columnExtensions={tableDetailColumnExtensions}
      />
      <TableHeaderRow cellComponent={DetailRowHeader}/>
    </Grid>
  )
}
//endregion

const styleDetail = theme => ({
  cell: {
    padding: theme.spacing(0, 2),
  },
})

const DetailBase = (props) => <Table.Cell {...props} style={{ paddingLeft: props.theme.spacing(2) }}/>

export const DetailCell = withStyles(styleDetail, { withTheme: true })(DetailBase)

