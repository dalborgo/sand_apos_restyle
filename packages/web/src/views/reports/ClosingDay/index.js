import React, { useRef, useState } from 'react'
import Page from 'src/components/Page'
import { Box, makeStyles } from '@material-ui/core'
import Header from './Header'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { DesktopDatePickerField } from 'src/components/DateRange'
import { Field, Form, Formik } from 'formik'
import Button from '@material-ui/core/Button'
import create from 'zustand'
import {immerMiddleware} from 'src/zustand'
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
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      padding: 0,
    },
  },
}))

const useStore = create(immerMiddleware(set => ({
  startDate: null,
  endDate: null,
  setDateRange: input => set(state => {
    const [startDate, endDate] = input
    if (startDate && endDate) {
      state.startDate = startDate
      state.endDate = endDate
    }
  }),
})))

const ClosingDay = () => {
  const classes = useStyles()
  const intl = useIntl()
  const endDateRef = useRef(null)
  const startDateRef = useRef(null)
  const [open, setOpen] = useState(false)
  const setDateRange = useStore(state => state.setDateRange)
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
            {
              () => (
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
              )
            }
          </Formik>
        </div>
      </div>
    </Page>
  )
}

export default ClosingDay
