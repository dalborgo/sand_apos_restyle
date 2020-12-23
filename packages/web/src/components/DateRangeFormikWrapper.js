import React, { memo, useRef, useState } from 'react'
import { Box, Button } from '@material-ui/core'
import { Field, Form, Formik } from 'formik'
import { DesktopDatePickerField } from './DateRange'

const DateRangeFormikWrapper = memo((function DateRangeFormikWrapper ({
  startDate,
  endDate,
  setDateRange,
}) {
  console.log('%cRENDER_FORMIK_WRAPPER', 'color: orange')
  const endDateRef = useRef(null)
  const startDateRef = useRef(null)
  const [open, setOpen] = useState(false)
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
    </Box>
  )
}))

export default DateRangeFormikWrapper
