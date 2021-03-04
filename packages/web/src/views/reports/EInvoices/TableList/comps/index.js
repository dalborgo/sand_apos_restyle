import { Button, colors, IconButton, makeStyles, SvgIcon, Tooltip, withStyles } from '@material-ui/core'
import React, { useState } from 'react'
import Box from '@material-ui/core/Box'
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { useDateTimeFormatter } from 'src/utils/formatters'
import { useHistory } from 'react-router'
import { useQueryClient } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import { useGeneralStore } from 'src/zustandStore'
import { axiosLocalInstance, buttonQuery } from 'src/utils/reactQueryFunctions'
import {
  AlertTriangle as AlertTriangleIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
  Frown as FrownIcon,
  HelpCircle as HelpCircleIcon,
  Mail as MailIcon,
  Send as SendIcon,
  UploadCloud as UploadCloudIcon,
} from 'react-feather'
import shallow from 'zustand/shallow'
import parse from 'html-react-parser'
import { messages } from 'src/translations/messages'
import { useIntl } from 'react-intl'
import clsx from 'clsx'
import { saveAs } from 'file-saver'
import { useSnackbar } from 'notistack'
import truncate from 'lodash/truncate'
import useEInvoiceStore from 'src/zustandStore/useEInvoiceStore'
import { sendXml } from '../../helpers'

const loadingSel = state => ({
  setLoading: state.setLoading,
  loading: state.loading,
})

const useStyles = makeStyles(theme => ({
  buttonRoot: {
    textTransform: 'none',
    lineHeight: '18px',
    textAlign: 'left',
  },
  buttonGreen: {
    width: '100%',
    color: 'rgba(0, 0, 0, 0.87)',
    backgroundColor: colors.green[100],
    '&:hover': {
      backgroundColor: colors.green[200],
    },
  },
  buttonErrorColor: {
    color: theme.palette.error.main,
  },
  buttonNormalColor: {
    color: colors.cyan[400],
  },
  buttonGreenColor: {
    color: colors.green[500],
  },
  divButtonLabel: {
    width: '100%',
    textAlign: 'left',
  },
}))

const eInvoiceSelector = state => ({
  endDateInMillis: state.endDateInMillis,
  startDateInMillis: state.startDateInMillis,
})

async function openDialog (docId, queryClient, setLoading, setIntLoading, history, state) {
  const queryKey = ['queries/query_by_id', { id: docId, columns: ['fatt_elett'] }]
  await buttonQuery(queryClient, queryKey, setLoading, setIntLoading)
  history.push({
    pathname: `${baseUrl}/notification/${docId}`,
    state,
  })
}

const baseUrl = '/app/reports/e-invoices'
const CellBase = props => {
  const { column, row, theme } = props
  const { startDateInMillis, endDateInMillis } = useEInvoiceStore(eInvoiceSelector, shallow)
  const dateTimeFormatter = useDateTimeFormatter()
  const { setLoading, loading } = useGeneralStore(loadingSel, shallow)
  const [intLoading, setIntLoading] = useState(false)
  const intl = useIntl()
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()
  const queryClient = useQueryClient()
  const docId = row._id
  const cellStyle = { paddingLeft: theme.spacing(2), whiteSpace: 'normal' }
  const state = {
    company: row.company,
    number: row.number,
    table: row.table_display,
    room: row.room_display,
    date: row.date,
    amount: row.final_price,
    status: row.statusCode,
  }
  if (column.name === 'download') {
    return (
      <VirtualTable.Cell {...props} style={cellStyle}>
        <Tooltip
          title={intl.formatMessage(messages['reports_e_invoices_download_xml'])}
        >
          <IconButton
            color="secondary"
            onClick={
              async () => {
                try {
                  setLoading(true)
                  const response = await axiosLocalInstance(`e-invoices/create_xml/${docId}`, {
                    method: 'post',
                  })
                  setLoading(false)
                  const { ok, results, message } = response.data
                  if (!ok) {return enqueueSnackbar(message)}
                  const { base64, filename } = results
                  saveAs(`data:application/xml;base64,${base64}`, filename)
                } catch ({ message }) {
                  enqueueSnackbar(message)
                }
              }
            }
          >
            <SvgIcon fontSize="small">
              <DownloadIcon/>
            </SvgIcon>
          </IconButton>
        </Tooltip>
      </VirtualTable.Cell>
    )
  }
  if (column.name === 'action') {
    return (
      <VirtualTable.Cell {...props} style={cellStyle}>
        {
          (statusCode => {
            switch (statusCode) {
              case 999:
              case 777:
                return (
                  <Button
                    classes={
                      {
                        textSecondary: classes.buttonErrorColor,
                      }
                    }
                    color="secondary"
                    disabled={loading === docId}
                    onClick={
                      async () => {
                        await openDialog(docId, queryClient, setLoading, setIntLoading, history, state)
                      }
                    }
                  >
                    {intl.formatMessage(messages[statusCode === 999 ? 'common_error' : 'reports_e_invoices_refused'])}&nbsp;&nbsp;
                    <SvgIcon fontSize="small">
                      <FrownIcon/>
                    </SvgIcon>
                  </Button>
                )
              case 2:
              case 3:
                return (
                  <Button
                    classes={
                      {
                        textSecondary: classes.buttonNormalColor,
                      }
                    }
                    color="secondary"
                    disabled={loading === docId}
                    onClick={
                      async () => {
                        await openDialog(docId, queryClient, setLoading, setIntLoading, history, state)
                      }
                    }
                  >
                    {intl.formatMessage(messages[statusCode === 3 ? 'reports_e_invoices_accepted' : 'reports_e_invoices_sent'])}&nbsp;&nbsp;
                    <SvgIcon fontSize="small">
                      {statusCode === 3 ? <UploadCloudIcon/> : <MailIcon/>}
                    </SvgIcon>
                  </Button>
                )
              case 1:
              case 0:
                return (
                  <Button
                    classes={
                      {
                        textSecondary: classes.buttonGreenColor,
                      }
                    }
                    color="secondary"
                    disabled={loading === docId}
                    onClick={
                      async () => {
                        await openDialog(docId, queryClient, setLoading, setIntLoading, history, state)
                      }
                    }
                  >
                    {intl.formatMessage(messages[statusCode === 1 ? 'reports_e_invoices_not_delivered' : 'reports_e_invoices_delivered'])}&nbsp;&nbsp;
                    <SvgIcon fontSize="small">
                      {statusCode === 1 ? <AlertTriangleIcon/> : <CheckIcon/>}
                    </SvgIcon>
                  </Button>
                )
              case undefined:// invia
                return (
                  <Button
                    color="secondary"
                    onClick={
                      async () => {
                        try {
                          setLoading(true)
                          const {
                            ok,
                            message,
                          } = await sendXml(owner, docId, endDateInMillis, startDateInMillis, queryClient)
                          enqueueSnackbar(message, { variant: ok ? 'success' : 'error' })
                          setLoading(false)
                        } catch ({ message }) {
                          setLoading(false)
                          enqueueSnackbar(message)
                        }
                      }
                    }
                  >
                    {intl.formatMessage(messages['reports_e_invoices_send'])}&nbsp;&nbsp;
                    <SvgIcon fontSize="small">
                      <SendIcon/>
                    </SvgIcon>
                  </Button>
                )
              default:
                return (
                  <Button
                    classes={
                      {
                        textSecondary: classes.buttonErrorColor,
                      }
                    }
                    color="secondary"
                    disabled={loading === docId}
                    onClick={
                      async () => {
                        await openDialog(docId, queryClient, setLoading, setIntLoading, history, state)
                      }
                    }
                  >
                    {intl.formatMessage(messages['common_undefined'])}&nbsp;&nbsp;
                    <SvgIcon fontSize="small">
                      {<HelpCircleIcon/>}
                    </SvgIcon>
                  </Button>
                )
            }
          })(row.statusCode)
        }
      </VirtualTable.Cell>
    )
  }
  if (column.name === 'date') {
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
              const queryKey = [`reports/e_invoice/${docId}`, { owner }]
              await buttonQuery(queryClient, queryKey, setLoading, setIntLoading)
              history.push(`${baseUrl}/${docId}`)
            }
          }
          size="small"
          variant="contained"
        >
          {
            parse(dateTimeFormatter(row.date, {
              year: undefined,
              month: 'short',
            }, { second: undefined }) + '<br/>' + row.closed_by)
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
  if (column.name === 'customer') {
    const company = row.company || ''
    const number = intl.formatMessage(messages['mode_INVOICE']) + (row.number ? ` ${row.number}` : '')
    return (
      <VirtualTable.Cell {...props} style={cellStyle}>
        <Button
          classes={
            {
              root: clsx(classes.buttonRoot, classes.buttonGreen),
            }
          }
          color="primary"
          disabled={intLoading}
          onClick={
            async () => {
              const queryKey = ['queries/query_by_id', { id: docId, columns: ['customer'] }]
              await buttonQuery(queryClient, queryKey, setLoading, setIntLoading)
              history.push({
                pathname: `${baseUrl}/change-customer-data/${docId}`,
                state,
              })
            }
          }
          size="small"
          variant="contained"
        >
          <div className={classes.divButtonLabel}>
            {
              parse(truncate(company, { length: 50, omission: '' }) + '<br/>' + number)
            }
          </div>
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
