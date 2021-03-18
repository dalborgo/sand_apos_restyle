import React, { memo, useRef, useState } from 'react'
import { Box, Button, withWidth } from '@material-ui/core'
import { Field, Form, Formik } from 'formik'
import { DesktopDatePickerField, MobileDatePickerField } from './DateRange'

const DateRangeFormikWrapper = memo(withWidth()(function DateRangeFormikWrapper ({
  startDate,
  endDate,
  setDateRange,
  width,
}) {
  const endDateRef = useRef(null)
  const startDateRef = useRef(null)
  const [open, setOpen] = useState(false)
  return (
    <Box alignItems="center" display="flex">
      <Box mr={2}>
        {
          ['lg', 'xl'].includes(width) ?
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
            :
            <MobileDatePickerField endDate={endDate} setDateRange={setDateRange} startDate={startDate}/>
        }
      </Box>
    </Box>
  )
}))

export default DateRangeFormikWrapper
