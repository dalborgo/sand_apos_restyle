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
import { axiosLocalInstance, baseURL, useSnackQueryError } from 'src/utils/reactQueryFunctions'
import useEInvoiceStore from 'src/zustandStore/useEInvoiceStore'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import moment from 'moment'
import { getEffectiveFetchingWithPrev } from 'src/utils/logics'
import TableList from './TableList'
import { useHistory, useParams } from 'react-router'
import EntriesTableDialog from 'src/components/EntriesTableDialog'
import { parentPath } from 'src/utils/urlFunctions'
import ChangeCustomerDialog from './ChangeCustomerDialog'

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
  setDateRange: state.setDateRange,
  startDate: state.startDate,
})

const changeCustomerMutation_ = async values => {
  const { data } = await axiosLocalInstance.put('queries/update_by_id', {
    ...values,
  })
  return data
}

const EInvoices = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const snackQueryError = useSnackQueryError()
  const history = useHistory()
  const queryClient = useQueryClient()
  const [isRefetch, setIsRefetch] = useState(false)
  const { docId, targetCustomerId } = useParams()
  const intl = useIntl()
  const { startDate, endDate, setDateRange } = useEInvoiceStore(eInvoiceSelector, shallow)
  const endDateInMillis = useMemo(() => endDate ? moment(endDate).format('YYYYMMDDHHmmssSSS') : undefined, [endDate])
  const startDateInMillis = useMemo(() => startDate ? moment(startDate).format('YYYYMMDDHHmmssSSS') : undefined, [startDate])
  const fetchKey = useMemo(() => ['reports/e_invoices', {
    endDateInMillis,
    owner,
    startDateInMillis,
  }], [endDateInMillis, owner, startDateInMillis])
  const targetCustomerKey = useMemo(() => ['docs/get_by_id', { docId: targetCustomerId }], [targetCustomerId])
  const { data, refetch, ...rest } = useQuery(fetchKey, {
    keepPreviousData: true,
    notifyOnChangeProps: ['data', 'error'],
    onError: snackQueryError,
    enabled: Boolean(startDate && endDate),
  })
  const refetchOnClick = useCallback(async () => {
    setIsRefetch(true)
    await refetch()
    setIsRefetch(false)
  }, [refetch])
  const closeChangeCustomerDialog = useMemo(() => {
    return () => history.push(parentPath(history.location.pathname, -2))
  }, [history])
  
  const changeCustomerMutation = useMutation(changeCustomerMutation_, {
    onMutate: async ({ set }) => {
      await queryClient.cancelQueries(targetCustomerKey)
      const { results: customer } = queryClient.getQueryData(targetCustomerKey)
      const newCustomer = { ...customer, ...set }
      queryClient.setQueryData(targetCustomerKey, { ok: true, results: newCustomer })
      return { previousData: customer }
    },
    onSettled: (data, error, variables, context) => {
      const { ok, message, err } = data || {}
      if (!ok || error) {
        queryClient.setQueryData(targetCustomerKey, context.previousData)
        snackQueryError(err || message || error)
      }
      queryClient.invalidateQueries(targetCustomerKey).then()
    },
  })
  
  const changeCustomerSubmit = useCallback(values => {
    changeCustomerMutation.mutate({ id: targetCustomerId, set: { ...values }, owner })
    closeChangeCustomerDialog()
    return values
  }, [closeChangeCustomerDialog, changeCustomerMutation, owner, targetCustomerId])
  const exportZip = useCallback(() => {
    const labelEnd = endDateInMillis && moment(endDateInMillis, 'YYYYMMDDHHmmssSSS').format('DD-MM-YYYY')
    const labelStart = startDateInMillis && moment(startDateInMillis, 'YYYYMMDDHHmmssSSS').format('DD-MM-YYYY')
    const fileName = `xml_${labelStart !== labelEnd ? `${labelStart}_${labelEnd}` : labelStart}.zip`
    window.open(`${baseURL}e-invoices/create_zip/${fileName}?owner=${owner}&startDateInMillis=${startDateInMillis}&endDateInMillis=${endDateInMillis}`, '_self')
  }, [endDateInMillis, owner, startDateInMillis])
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
        targetCustomerId &&
        <ChangeCustomerDialog
          close={closeChangeCustomerDialog}
          docId={targetCustomerId}
          onSubmit={changeCustomerSubmit}
        />
      }
    </Page>
  )
}

export default EInvoices
