import React, { memo, useRef, useState } from 'react'
import Page from 'src/components/Page'
import { Box, Button, makeStyles, Typography } from '@material-ui/core'
import Header from './Header'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { DesktopDatePickerField } from 'src/components/DateRange'
import { Field, Form, Formik } from 'formik'
import create from 'zustand'
import shallow from 'zustand/shallow'
import { immerMiddleware } from 'src/zustand'
import { useQuery } from 'react-query'
import useAuth from 'src/hooks/useAuth'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    height: '100%',
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
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


const FormikWrapper = memo((function FormikWrapper () {
  console.log('%cRENDER_FORMIK_WRAPPER', 'color: orange')
  const endDateRef = useRef(null)
  const startDateRef = useRef(null)
  const [open, setOpen] = useState(false)
  const setDateRange = useStore(state => state.setDateRange)
  return (
    <Formik
      initialValues={{ dateRange: [null, null] }}
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
/*const selStartDate = state => state.startDate
const selEndDate = state => state.endDate*/

const useStore = create(immerMiddleware(set => ({
  startDate: null,
  startDateInMillis: null,
  endDate: null,
  endDateInMillis: null,
  setDateRange: input => set(state => {
    const [startDate, endDate] = input
    if (startDate && endDate) {
      state.startDate = startDate
      state.endDate = endDate
      state.startDateInMillis = startDate.format('YYYYMMDDHHmmssSSS')
      state.endDateInMillis = endDate.format('YYYYMMDDHHmmssSSS')
    }
  }),
})))

const dateSelector = state => ({ startDateInMillis: state.startDateInMillis, endDateInMillis: state.endDateInMillis })
const ClosingDay = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const intl = useIntl()
  const { startDateInMillis, endDateInMillis } = useStore(dateSelector, shallow)
  
  const closingDayList = useQuery(['reports/closing_days', { startDateInMillis, endDateInMillis, owner }], {
    enabled: startDateInMillis && endDateInMillis,
    onSuccess: ({ results }) => {
      console.log('results:', results)
    },
  })
  
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
            <FormikWrapper/>
          </Box>
          <Box bgcolor="grey.300" height="100%" mt={2} p={1}>
            <Typography>
              {JSON.stringify(closingDayList?.data, null, 2)}
            </Typography>
          </Box>
        </div>
      </div>
    </Page>
  )
}

export default ClosingDay
