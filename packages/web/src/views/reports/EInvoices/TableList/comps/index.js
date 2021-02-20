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
import { Download as DownloadIcon, Send as SendIcon } from 'react-feather'
import shallow from 'zustand/shallow'
import parse from 'html-react-parser'
import { messages } from 'src/translations/messages'
import { useIntl } from 'react-intl'
import clsx from 'clsx'
import { saveAs } from 'file-saver'
import { useSnackbar } from 'notistack'

const loadingSel = state => ({ setLoading: state.setLoading, loading: state.loading })

const useStyles = makeStyles(theme => ({
  buttonRoot: {
    textTransform: 'none',
    lineHeight: '18px',
    textAlign: 'left',
  },
  buttonGreen: {
    color: 'rgba(0, 0, 0, 0.87)',
    backgroundColor: colors.green[100],
    '&:hover': {
      backgroundColor: colors.green[200],
    },
  },
  buttonErrorColor: {
    color: theme.palette.error.main,
  },
}))
const CellBase = props => {
  const { column, row, theme } = props
  const dateTimeFormatter = useDateTimeFormatter()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const [intLoading, setIntLoading] = useState(false)
  const intl = useIntl()
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()
  const queryClient = useQueryClient()
  const docId = row._id
  const cellStyle = { paddingLeft: theme.spacing(2) }
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
                  const data = { owner }
                  setLoading(true)
                  const response = await axiosLocalInstance(`e-invoices/create_xml/${docId}`, {
                    data,
                    method: 'post',
                  })
                  setLoading(false)
                  const { base64, filename } = response.data
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
    const hasSendError = row.statusCode === 999
    return (
      <VirtualTable.Cell {...props} style={cellStyle}>
        {
          (statusCode => {
            switch (statusCode) {
              case 3:
                return <Button>ACCETTATA</Button>
              case 2:
                return <Button>INVIATA</Button>
              case 1:
                return <Button>NON CONSEGNATA</Button>
              case 0:
                return (
                  <Button>CONSEGNATA</Button>
                )
              default:
                return (
                  <Tooltip
                    title={hasSendError ? intl.formatMessage(messages['reports_e_invoices_send_error']) : intl.formatMessage(messages['reports_e_invoices_send'])}
                  >
                    <Button
                      classes={
                        {
                          textSecondary: hasSendError ? classes.buttonErrorColor : undefined,
                        }
                      }
                      color="secondary"
                      onClick={
                        async () => {
                          try {
                            const data = { owner }
                            setLoading(true)
                            const {
                              data: {
                                ok,
                                results,
                                message,
                              },
                            } = await axiosLocalInstance(`e-invoices/send_xml/${docId}`, {
                              data,
                              method: 'post',
                            })
                            console.log(results)
                            setLoading(false)
                            await queryClient.invalidateQueries('reports/e_invoices')
                            enqueueSnackbar(message, { variant: ok ? 'success' : 'error' })
                          } catch ({ message }) {
                            setLoading(false)
                            enqueueSnackbar(message)
                          }
                        }
                      }
                    >
                      INVIA&nbsp;&nbsp;
                      <SvgIcon fontSize="small">
                        <SendIcon/>
                      </SvgIcon>
                    </Button>
                  </Tooltip>
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
  if (column.name === 'type') {
    const company = row.company || ''
    const companyId = row.company_id
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
              const queryKey = ['docs/get_by_id', { docId: companyId }]
              await buttonQuery(queryClient, queryKey, setLoading, setIntLoading)
              history.push({
                pathname: `${window.location.pathname}/change-customer-data/${companyId}`,
                state: {
                  company: row.company,
                  number: row.number,
                  table: row.table_display,
                  room: row.room_display,
                  date: row.date,
                  amount: row.final_price,
                },
              })
            }
          }
          size="small"
          variant="contained"
        >
          {
            parse(company + '<br/>' + number)
          }
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
