import React, { useCallback, useState } from 'react'
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
import { useSnackQueryError } from 'src/utils/reactQueryFunctions'
import useEInvoiceStore from 'src/zustandStore/useEInvoiceStore'
import { useQuery } from 'react-query'
import moment from 'moment'
import { getEffectiveFetchingWithPrev } from 'src/utils/logics'
import TableList from './TableList'
import { useParams } from 'react-router'
import EntriesTableDialog from 'src/components/EntriesTableDialog'

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

const EInvoices = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const snackQueryError = useSnackQueryError()
  const [isRefetch, setIsRefetch] = useState(false)
  const { docId, targetDocId } = useParams()
  const intl = useIntl()
  const { startDate, endDate, setDateRange } = useEInvoiceStore(eInvoiceSelector, shallow)
  const { data, refetch, ...rest } = useQuery(['reports/closed_tables', {
    modeFilter: 'INVOICE',
    endDateInMillis: endDate ? moment(endDate).format('YYYYMMDDHHmmssSSS') : undefined,
    owner,
    startDateInMillis: startDate ? moment(startDate).format('YYYYMMDDHHmmssSSS') : undefined,
  }], {
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
  console.log('data:', data)
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
            isFetching={effectiveFetching && !data?.results?.length}
            isIdle={rest.isIdle}
            rows={data?.results || []}
          />
        </Paper>
      </DivContentWrapper>
      {docId && <EntriesTableDialog docId={docId} urlKey="reports/closed_table"/>}
    </Page>
  )
}

export default EInvoices
