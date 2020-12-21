import React from 'react'
import Page from 'src/components/Page'
import { Box, makeStyles } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import StandardHeader from 'src/components/StandardHeader'
import shallow from 'zustand/shallow'
import { useQuery } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import Paper from '@material-ui/core/Paper'
import TableList from './TableList'
import useClosingDayStore from 'src/zustandStore/useClosingDayStore'
import { useParams } from 'react-router'
import ClosingDayDialog from './ClosingDayDialog'
import { useSnackQueryError } from 'src/utils/reactQueryFunctions'
import { getEffectiveFetching } from 'src/utils/logics'
import moment from 'moment'
import DivContentWrapper from 'src/components/DivContentWrapper'
import DateRangeFormikWrapper from 'src/components/DateRangeFormikWrapper'

const useStyles = makeStyles(() => ({
  paper: {
    height: '100%',
  },
}))

const closingSelector = state => ({
  closingRows: state.closingRows,
  endDate: state.endDate,
  setClosingRows: state.setClosingRows,
  setDateRange: state.setDateRange,
  startDate: state.startDate,
})

const ClosingDay = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const { docId } = useParams()
  const classes = useStyles()
  const snackQueryError = useSnackQueryError()
  const intl = useIntl()
  /* useEffect(() => {return () => {reset()}}, [reset])*/
  const { startDate, endDate, setDateRange, closingRows, setClosingRows } = useClosingDayStore(closingSelector, shallow)
  const { isIdle, refetch, ...rest } = useQuery(['reports/closing_days', {
    startDateInMillis: startDate ? moment(startDate).format('YYYYMMDDHHmmssSSS') : undefined,
    endDateInMillis: endDate ? moment(endDate).format('YYYYMMDDHHmmssSSS') : undefined,
    owner,
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
      <Box p={2}>
        <StandardHeader>
          <FormattedMessage defaultMessage="Chiusure di giornata" id="reports.closing_day.header_title"/>
        </StandardHeader>
      </Box>
      <DateRangeFormikWrapper
        endDate={endDate}
        isFetching={effectiveFetching}
        refetch={refetch}
        setDateRange={setDateRange}
        startDate={startDate}
      />
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
