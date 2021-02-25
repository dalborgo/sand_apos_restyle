import React, { memo } from 'react'
import {
  Avatar,
  Button,
  DialogActions,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  SvgIcon,
} from '@material-ui/core'
import { AlertCircle as AlertCircleIcon, FileText as FileTextIcon, Save as SaveIcon } from 'react-feather'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import shallow from 'zustand/shallow'
import useEInvoiceStore from 'src/zustandStore/useEInvoiceStore'
import { useSnackbar } from 'notistack'
import { useQueryClient } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import { useGeneralStore } from 'src/zustandStore'
import { saveAs } from 'file-saver'
import { useLocation } from 'react-router-dom'
import { EInvoiceHeaderDialog, loadStatus, sendXml } from '../../../helpers'
import { axiosLocalInstance } from 'src/utils/reactQueryFunctions'

const useStyles = makeStyles(theme => ({
  buttonErrorColor: {
    color: theme.palette.error.main,
  },
  errorIcon: {
    backgroundColor: theme.palette.error.main,
  },
  defaultIcon: {
    backgroundColor: theme.palette.secondary.main,
  },
  dialogContent: {
    padding: 0,
    minWidth: 400,
  },
  dialogAction: {
    padding: theme.spacing(1, 2),
  },
}))
const eInvoiceSelector = state => ({
  endDateInMillis: state.endDateInMillis,
  startDateInMillis: state.startDateInMillis,
})
const loadingSel = state => ({ setLoading: state.setLoading })
const StatusReport = ({ data, onClose, docId }) => {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const { state = {} } = useLocation()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const queryClient = useQueryClient()
  const { selectedCode: { code: owner } } = useAuth()
  const { startDateInMillis, endDateInMillis } = useEInvoiceStore(eInvoiceSelector, shallow)
  const intl = useIntl()
  const {
    res_invoice_upload: { uploadFileName, errorDescription, errorCode },
    status: { status_code: statusCode },
  } = data
  const error = errorDescription ? errorDescription.split(' - ')[0] : ''
  return (
    <>
      <DialogContent className={classes.dialogContent}>
        {
          state?.company &&
          <EInvoiceHeaderDialog {...state}/>
        }
        <List disablePadding>
          {
            uploadFileName &&
            <ListItem>
              <ListItemAvatar>
                <Avatar className={classes.defaultIcon}>
                  <SvgIcon fontSize="small">
                    <SaveIcon/>
                  </SvgIcon>
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={intl.formatMessage(messages['common_filename'])}
                primaryTypographyProps={{ variant: 'subtitle2', color: 'textPrimary' }}
                secondary={uploadFileName}
              />
            </ListItem>
          }
          {
            (statusCode => {
              switch (statusCode) {
                case 999:
                  return (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar className={classes.errorIcon}>
                          <SvgIcon fontSize="small">
                            <AlertCircleIcon/>
                          </SvgIcon>
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${intl.formatMessage(messages['common_error'])}: ${errorCode}`}
                        primaryTypographyProps={{ variant: 'subtitle2', color: 'textPrimary' }}
                        secondary={messages[`e_invoices_error_${errorCode}`] ? intl.formatMessage(messages['common_error']) : error}
                      />
                    </ListItem>
                  )
                default:
                  return
              }
            })(statusCode)
          }
        </List>
      </DialogContent>
      <DialogActions className={classes.dialogAction}>
        {
          (statusCode => {
            switch (statusCode) {
              case 999:
                return (
                  <Button
                    autoFocus
                    color="secondary"
                    onClick={
                      async () => {
                        try {
                          onClose()
                          setLoading(docId)
                          const {
                            ok,
                            message,
                          } = await sendXml(owner, docId, endDateInMillis, startDateInMillis, queryClient)
                          setLoading(false)
                          enqueueSnackbar(message, { variant: ok ? 'success' : 'error' })
                        } catch ({ message }) {
                          setLoading(false)
                          enqueueSnackbar(message)
                        }
                      }
                    }
                  >
                    <FormattedMessage defaultMessage="RE-INVIA" id="reports.e_invoices_resend"/>
                  </Button>
                )
              case 2:
              case 3:
                return (
                  <Button
                    color="secondary"
                    onClick={
                      async () => {
                        try {
                          onClose()
                          setLoading(docId)
                          const {
                            ok,
                            results,
                            message,
                          } = await loadStatus(owner, docId, endDateInMillis, startDateInMillis, queryClient)
                          setLoading(false)
                          if (!ok) {return enqueueSnackbar(message)}
                          const { code } = results || {}
                          const text = intl.formatMessage(messages[code === 'UPDATED' ? 'reports_e_invoices_new_state' : 'reports_e_invoices_same_state'])
                          enqueueSnackbar(text, { variant: code === 'UPDATED' ? 'success' : 'info' })
                        } catch ({ message }) {
                          enqueueSnackbar(message)
                        }
                      }
                    }
                  >
                    <FormattedMessage defaultMessage="AGGIORNA" id="reports.e_invoices_update"/>
                  </Button>
                )
              default:
                return (
                  <Button
                    classes={
                      {
                        textSecondary: [0, 1].includes(statusCode) ? undefined : classes.buttonErrorColor,
                      }
                    }
                    color="secondary"
                    onClick={
                      async () => {
                        try {
                          onClose()
                          setLoading(docId)
                          const {
                            data: {
                              ok,
                              results,
                              message,
                            },
                          } = await axiosLocalInstance(`e-invoices/xml_notification/${uploadFileName}`, {
                            method: 'post',
                          })
                          setLoading(false)
                          if (!ok) {return enqueueSnackbar(message)}
                          const { base64, filename } = results
                          if (filename) {
                            saveAs(`data:application/xml;base64,${base64}`, filename)
                          } else {
                            enqueueSnackbar(intl.formatMessage(messages['reports_e_invoices_not_found']))
                          }
                        } catch ({ message }) {
                          setLoading(false)
                          enqueueSnackbar(message)
                        }
                      }
                    }
                  >
                    <FormattedMessage defaultMessage="Notifica Xml" id="reports.e_invoices_xml_notification"/>&nbsp;
                    <SvgIcon fontSize="small">
                      <FileTextIcon/>
                    </SvgIcon>
                  </Button>
                )
            }
          })(statusCode)
        }
        {
          statusCode < 4 &&
          <Button
            color="secondary"
            onClick={
              async () => {
                try {
                  onClose()
                  setLoading(docId)
                  const {
                    data: {
                      ok,
                      results,
                      message,
                    },
                  } = await axiosLocalInstance(`e-invoices/search/${uploadFileName}`, {
                    method: 'post',
                  })
                  setLoading(false)
                  if (!ok) {return enqueueSnackbar(message)}
                  const { base64, filename } = results
                  saveAs(`data:application/pdf;base64,${base64}`, filename)
                } catch ({ message }) {
                  setLoading(false)
                  enqueueSnackbar(message)
                }
              }
            }
          >
            <FormattedMessage defaultMessage="File pdf" id="reports.e_invoices_pdf_file"/>&nbsp;
            <SvgIcon fontSize="small">
              <SaveIcon/>
            </SvgIcon>
          </Button>
        }
      </DialogActions>
    </>
  )
}

export default memo(StatusReport)

