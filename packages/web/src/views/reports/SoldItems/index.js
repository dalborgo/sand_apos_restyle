import React, { useCallback, useMemo, useState } from 'react'
import Page from 'src/components/Page'
import { Box, makeStyles, Paper } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import StandardHeader from 'src/components/StandardHeader'
import { StandardBreadcrumb } from 'src/components/StandardBreadcrumb'
import DivContentWrapper from 'src/components/DivContentWrapper'
import DateRangeFormikWrapper from 'src/components/DateRangeFormikWrapper'
import useSoldItemsStore from 'src/zustandStore/useSoldItemsStore'
import shallow from 'zustand/shallow'
import useAuth from 'src/hooks/useAuth'
import { useQuery } from 'react-query'
import { useSnackQueryError } from 'src/utils/reactQueryFunctions'
import { getEffectiveFetchingWithPrev } from 'src/utils/logics'
import IconButtonLoader from 'src/components/IconButtonLoader'
import TableList from './TableList'

const useStyles = makeStyles(theme => ({
  paper: {
    height: '100%',
  },
  container: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {// mobile
      padding: theme.spacing(0, 2, 2),
    },
  },
}))

const soldItemsSelector = state => ({
  endDate: state.endDate,
  endDateInMillis: state.endDateInMillis,
  setDateRange: state.setDateRange,
  startDate: state.startDate,
  startDateInMillis: state.startDateInMillis,
})

const SoldItems = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const snackQueryError = useSnackQueryError()
  const [isRefetch, setIsRefetch] = useState(false)
  const intl = useIntl()
  const { startDate, endDate, setDateRange, endDateInMillis, startDateInMillis } = useSoldItemsStore(soldItemsSelector, shallow)
  const fetchKey = useMemo(() => ['reports/sold_items', {
    start: startDateInMillis,
    owner,
    end: endDateInMillis,
  }], [endDateInMillis, owner, startDateInMillis])
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
  const effectiveFetching = getEffectiveFetchingWithPrev(rest, isRefetch)
  console.log('data:', data)
  return (
    <Page
      title={intl.formatMessage(messages['menu_sold_items'])}
    >
      <div className={classes.container}>
        <StandardHeader
          breadcrumb={
            <StandardBreadcrumb
              crumbs={[{ to: '/app', name: 'Home' }, { name: 'Report' } ]}
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
          <FormattedMessage defaultMessage="Venduto" id="management.sold_items.header_title"/>
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
    </Page>
  )
}

export default SoldItems
