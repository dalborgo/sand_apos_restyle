import React, { memo, useRef, useState } from 'react'
import Page from 'src/components/Page'
import { Box, Button, makeStyles } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { DesktopDatePickerField } from 'src/components/DateRange'
import StandardHeader from 'src/components/StandardHeader'
import { Field, Form, Formik } from 'formik'
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
import IconButtonLoader from 'src/components/IconButtonLoader'
import DivContentWrapper from 'src/components/DivContentWrapper'

const useStyles = makeStyles(() => ({
  paper: {
    height: '100%',
  },
}))

const FormikWrapper = memo((function FormikWrapper ({ startDate, endDate, refetch, isFetching }) {
  console.log('%cRENDER_FORMIK_WRAPPER', 'color: orange')
  const endDateRef = useRef(null)
  const startDateRef = useRef(null)
  const [open, setOpen] = useState(false)
  const setDateRange = useClosingDayStore(state => state.setDateRange)
  return (
    <Box alignItems="center" display="flex" p={2} pt={1}>
      <Box mr={2}>
        <Formik
          initialValues={{ dateRange: [startDate, endDate] }}
          onSubmit={
            value => {
              endDateRef.current.blur()
              startDateRef.current.blur()
              setOpen(false)
              setDateRange(value.dateRange)
            }
          }
        >
          <Form>
            <Field
              component={DesktopDatePickerField}
              endDateRef={endDateRef}
              name="dateRange"
              open={open}
              setDateRange={setDateRange}
              setOpen={setOpen}
              startDateRef={startDateRef}
            />
            <Button style={{ display: 'none' }} type="submit"/>
          </Form>
        </Formik>
      </Box>
      <IconButtonLoader
        isFetching={isFetching}
        onClick={
          () => {
            refetch().then()
          }
        }
      />
    </Box>
  )
}))

const closingSelector = state => ({
  endDate: state.endDate,
  startDate: state.startDate,
  closingRows: state.closingRows,
  setClosingRows: state.setClosingRows,
})

const ClosingDay = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const { docId } = useParams()
  const classes = useStyles()
  const snackQueryError = useSnackQueryError()
  const intl = useIntl()
  /* useEffect(() => {return () => {reset()}}, [reset])*/
  const { startDate, endDate, closingRows, setClosingRows } = useClosingDayStore(closingSelector, shallow)
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
      <FormikWrapper endDate={endDate} isFetching={effectiveFetching} refetch={refetch} startDate={startDate}/>
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
