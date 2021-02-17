import React from 'react'
import Page from 'src/components/Page'
import { Box, makeStyles, Paper } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import StandardHeader from 'src/components/StandardHeader'
import { StandardBreadcrumb } from 'src/components/StandardBreadcrumb'
import DivContentWrapper from 'src/components/DivContentWrapper'
import shallow from 'zustand/shallow'
import { useQuery } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import TableList from './TableList'
import useClosingDayStore from 'src/zustandStore/useClosingDayStore'
import { useParams } from 'react-router'
import ClosingDayDialog from './ClosingDayDialog'
import { useSnackQueryError } from 'src/utils/reactQueryFunctions'
import { getEffectiveFetching } from 'src/utils/logics'
import moment from 'moment'
import DateRangeFormikWrapper from 'src/components/DateRangeFormikWrapper'
import IconButtonLoader from 'src/components/IconButtonLoader'
import { useGeneralStore } from 'src/zustandStore'

const useStyles = makeStyles(theme => ({
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

const closingSelector = state => ({
  closingRows: state.closingRows,
  endDate: state.endDate,
  setClosingRows: state.setClosingRows,
  setDateRange: state.setDateRange,
  startDate: state.startDate,
})


const selAllIn = state => state.allIn
const ClosingDay = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const { docId } = useParams()
  const classes = useStyles()
  const snackQueryError = useSnackQueryError()
  const allIn = useGeneralStore(selAllIn)
  const intl = useIntl()
  /* useEffect(() => {return () => {reset()}}, [reset])*/
  const { startDate, endDate, setDateRange, closingRows, setClosingRows } = useClosingDayStore(closingSelector, shallow)
  const { isIdle, refetch, ...rest } = useQuery(['reports/closing_days', {
    allIn,
    endDateInMillis: endDate ? moment(endDate).format('YYYYMMDDHHmmssSSS') : undefined,
    owner,
    startDateInMillis: startDate ? moment(startDate).format('YYYYMMDDHHmmssSSS') : undefined,
  }], {
    onError: snackQueryError,
    enabled: Boolean(startDate && endDate),
    onSettled: data => {
      if (data?.ok) {
        setClosingRows(data.results)
      }
    },
  })
  const effectiveFetching = getEffectiveFetching(rest)
  return (
    <Page
      title={intl.formatMessage(messages['menu_closing_day'])}
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
                  onClick={refetch}
                />
              </Box>
            </Box>
          }
        >
          <FormattedMessage defaultMessage="Chiusure di giornata" id="reports.closing_day.header_title"/>
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
          <TableList isFetching={effectiveFetching && !closingRows.length} isIdle={isIdle} rows={closingRows}/>
        </Paper>
      </DivContentWrapper>
      {docId && <ClosingDayDialog docId={docId}/>}
    </Page>
  )
}

export default ClosingDay
