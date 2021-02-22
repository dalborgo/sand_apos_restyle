import React, { useCallback, useMemo, useState } from 'react'
import Page from 'src/components/Page'
import { Box, makeStyles, Paper } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import StandardHeader from 'src/components/StandardHeader'
import { StandardBreadcrumb } from 'src/components/StandardBreadcrumb'
import IconButtonLoader from 'src/components/IconButtonLoader'
import DateRangeFormikWrapper from 'src/components/DateRangeFormikWrapper'
import shallow from 'zustand/shallow'
import DivContentWrapper from 'src/components/DivContentWrapper'
import useAuth from 'src/hooks/useAuth'
import { axiosLocalInstance, manageFile, useSnackQueryError } from 'src/utils/reactQueryFunctions'
import useEInvoiceStore from 'src/zustandStore/useEInvoiceStore'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import moment from 'moment'
import { getEffectiveFetchingWithPrev } from 'src/utils/logics'
import TableList from './TableList'
import { useHistory, useParams } from 'react-router'
import EntriesTableDialog from 'src/components/EntriesTableDialog'
import { parentPath } from 'src/utils/urlFunctions'
import ChangeCustomerDialog from './ChangeCustomerDialog'
import { useSnackbar } from 'notistack'
import { useGeneralStore } from 'src/zustandStore'
import NotificationDialog from './NotificationDialog'

const useStyles = makeStyles((theme) => ({
  paper: {
    height: '100%',
  },
  container: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: { //mobile
      padding: theme.spacing(0, 2),
    },
  },
}))

const eInvoiceSelector = state => ({
  endDate: state.endDate,
  endDateInMillis: state.endDateInMillis,
  setDateRange: state.setDateRange,
  startDate: state.startDate,
  startDateInMillis: state.startDateInMillis,
})

const changeCustomerMutation_ = async values => {
  const { data } = await axiosLocalInstance.put('e-invoices/update_customer', {
    ...values,
  })
  return data
}

const loadingSel = state => ({ setLoading: state.setLoading })
const EInvoices = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const snackQueryError = useSnackQueryError()
  const { enqueueSnackbar } = useSnackbar()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const history = useHistory()
  const queryClient = useQueryClient()
  const [isRefetch, setIsRefetch] = useState(false)
  const { docId, targetPaymentId, notificationPaymentId } = useParams()
  const intl = useIntl()
  const { startDate, endDate, setDateRange, endDateInMillis, startDateInMillis } = useEInvoiceStore(eInvoiceSelector, shallow)
  const fetchKey = useMemo(() => ['reports/e_invoices', {
    endDateInMillis,
    owner,
    startDateInMillis,
  }], [endDateInMillis, owner, startDateInMillis])
  const targetPaymentKey = useMemo(() => ['queries/query_by_id', {
    id: targetPaymentId,
    columns: ['customer'],
  }], [targetPaymentId])
  const { data, refetch, ...rest } = useQuery(fetchKey, {
    enabled: Boolean(startDate && endDate),
    keepPreviousData: true,
    notifyOnChangeProps: ['data', 'error'],
    onError: snackQueryError,
  })
  const refetchOnClick = useCallback(async () => {
    setIsRefetch(true)
    await refetch()
    setIsRefetch(false)
  }, [refetch])
  const closeDialog = useMemo(() => {
    return () => history.push(parentPath(history.location.pathname, -2))
  }, [history])
  
  const changeCustomerMutation = useMutation(changeCustomerMutation_, {
    onMutate: async ({ set }) => {
      await queryClient.cancelQueries(targetPaymentKey)
      const previousData = queryClient.getQueryData(targetPaymentKey)
      const newCustomer = { ...previousData.results, ...set }
      queryClient.setQueryData(targetPaymentKey, { ok: true, results: newCustomer })
      return { previousData, newCustomer }
    },
    onSettled: (data, error, variables, context) => {
      const { ok, message, err, results: paymentsIds } = data || {}
      if (!ok || error) {
        queryClient.setQueryData(targetPaymentKey, context.previousData)
        snackQueryError(err || message || error)
      } else {
        for (let id of paymentsIds) {
          if (id === targetPaymentId) { continue}
          queryClient.setQueryData(['queries/query_by_id', { id, columns: ['customer'] }], {
            ok: true,
            results: context.newCustomer,
          })
        }
      }
      queryClient.invalidateQueries(targetPaymentKey).then()
    },
  })
  
  const changeCustomerSubmit = useCallback(values => {
    const { _id: id, ...rest } = values
    changeCustomerMutation.mutate({ id, set: { ...rest }, owner })
    closeDialog()
    return values
  }, [closeDialog, changeCustomerMutation, owner])
  const exportZip = useCallback(async () => {
    const labelEnd = endDateInMillis && moment(endDateInMillis, 'YYYYMMDDHHmmssSSS').format('DD-MM-YYYY')
    const labelStart = startDateInMillis && moment(startDateInMillis, 'YYYYMMDDHHmmssSSS').format('DD-MM-YYYY')
    const filename = `xml_${labelStart !== labelEnd ? `${labelStart}_${labelEnd}` : labelStart}.zip`
    const data = {
      endDateInMillis,
      owner,
      startDateInMillis,
    }
    setLoading(true)
    const { ok, message } = await manageFile(
      'e-invoices/create_zip',
      filename,
      'application/zip',
      data
    )
    setLoading(false)
    !ok && enqueueSnackbar(message)
  }, [endDateInMillis, enqueueSnackbar, owner, setLoading, startDateInMillis])
  const effectiveFetching = getEffectiveFetchingWithPrev(rest, isRefetch)
  return (
    <Page
      title={intl.formatMessage(messages['menu_e_invoices'])}
    >
      <div className={classes.container}>
        <StandardHeader
          breadcrumb={
            <StandardBreadcrumb
              crumbs={[{ to: '/app', name: 'DashBoard' }, { name: 'Report' }]}
            />
          }
          rightComponent={
            <Box alignItems="center" display="flex">
              <Box>
                <IconButtonLoader
                  disabled={!startDate}
                  isFetching={effectiveFetching}
                  onClick={refetchOnClick}
                />
              </Box>
            </Box>
          }
        >
          <FormattedMessage defaultMessage="Fatture elettroniche" id="reports.e_invoices.header_title"/>
        </StandardHeader>
      </div>
      <Box alignItems="center" display="flex" p={2} pt={1}>
        <DateRangeFormikWrapper
          endDate={endDate}
          setDateRange={setDateRange}
          startDate={startDate}
        />
      </Box>
      <DivContentWrapper>
        <Paper className={classes.paper}>
          <TableList
            exportZip={exportZip}
            isFetching={effectiveFetching && !data?.results?.length}
            isIdle={rest.isIdle}
            rows={data?.results || []}
          />
        </Paper>
      </DivContentWrapper>
      {docId && <EntriesTableDialog docId={docId} urlKey="reports/e_invoice"/>}
      {
        targetPaymentId &&
        <ChangeCustomerDialog
          close={closeDialog}
          docId={targetPaymentId}
          onSubmit={changeCustomerSubmit}
        />
      }
      {
        notificationPaymentId &&
        <NotificationDialog
          close={closeDialog}
          docId={notificationPaymentId}
        />
      }
    </Page>
  )
}

export default EInvoices
