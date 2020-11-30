import React, { memo, useRef, useState } from 'react'
import Page from 'src/components/Page'
import { Box, Button, makeStyles } from '@material-ui/core'
import Header from './Header'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { DesktopDatePickerField } from 'src/components/DateRange'
import { Field, Form, Formik } from 'formik'
import shallow from 'zustand/shallow'
import { useQuery } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import Paper from '@material-ui/core/Paper'
import TableList from './TableList'
import useClosingDayStore from 'src/zustandStore/useClosingDayStore'
import useGeneralStore from 'src/zustandStore/useGeneralStore'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    height: '100%',
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  paper: {
    height: '100%',
    marginTop: theme.spacing(3),
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    display: 'flex',
    overflowY: 'hidden',
    overflowX: 'auto',
  },
  innerFirst: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      padding: 0,
    },
  },
}))

const FormikWrapper = memo((function FormikWrapper ({ startDate, endDate }) {
  console.log('%cRENDER_FORMIK_WRAPPER', 'color: orange')
  const endDateRef = useRef(null)
  const startDateRef = useRef(null)
  const [open, setOpen] = useState(false)
  const setDateRange = useClosingDayStore(state => state.setDateRange)
  return (
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
  )
}))

const dateSelector = state => ({
  startDateInMillis: state.startDateInMillis,
  endDateInMillis: state.endDateInMillis,
  endDate: state.endDate,
  startDate: state.startDate,
  state,
  reset: state.reset,
})
console.log(useGeneralStore.getState().priority)

const ClosingDay = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const intl = useIntl()
  const { startDateInMillis, endDateInMillis, startDate, endDate } = useClosingDayStore(dateSelector, shallow)
  /* useEffect(() => {return () => {reset()}}, [reset])*/
  const { isLoading, data = {}, isIdle } = useQuery(['reports/closing_days', {
    startDateInMillis,
    endDateInMillis,
    owner,
  }], {
    enabled: startDateInMillis && endDateInMillis,
  })
  const rows = data.results || []
  /*
  [
  { _id: 1, close_date: '2020-11-15', owner: 1 },
  { _id: 2, close_date: '2020-11-16', owner: 2 },
  ]
  */
  return (
    <Page
      className={classes.root}
      title={intl.formatMessage(messages['menu_closing_day'])}
    >
      <Box p={3} pb={2}>
        <Header/>
      </Box>
      <div className={classes.content}>
        <div className={classes.innerFirst}>
          <Box display="flex">
            <FormikWrapper endDate={endDate} startDate={startDate}/>
          </Box>
          <Paper className={classes.paper}>
            <TableList isIdle={isIdle} isLoading={isLoading} rows={rows}/>
          </Paper>
        </div>
      </div>
    </Page>
  )
}

export default ClosingDay
