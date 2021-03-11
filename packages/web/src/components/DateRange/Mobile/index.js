import React, { useRef, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import { DateRangeDelimiter, MobileDateRangePicker } from '@material-ui/pickers'
import { makeStyles } from '@material-ui/core'
import { messages } from 'src/translations/messages'
import { FormattedMessage, useIntl } from 'react-intl'
import { getMaskMap } from 'src/translations'
import useSettings from 'src/hooks/useSettings'

const useStyles = makeStyles(theme => ({
  delimiterRoot: {
    color: theme.palette.action.active,
  },
  textFieldRoot: {
    backgroundColor: theme.palette.background.default,
  },
}))

const DatePickerField = ({ startDate, endDate, setDateRange }) => {
  const [value, setValue] = useState([startDate, endDate])
  const classes = useStyles()
  const intl = useIntl()
  const { settings: { locale } } = useSettings()
  const endDateRef = useRef(null)
  const startDateRef = useRef(null)
  return (
    <>
      <MobileDateRangePicker
        cancelText={intl.formatMessage(messages['common_cancel'])}
        disableAutoMonthSwitching
        disableFuture
        endText={intl.formatMessage(messages['date_range_end'])}
        error={false}
        helperText={null}
        InputLabelProps={
          {
            shrink: true,
          }
        }
        mask={getMaskMap(locale)}
        onAccept={
          async date => {
            await setDateRange(date)
            endDateRef.current && endDateRef.current.blur()
            startDateRef.current && startDateRef.current.blur()
          }
        }
        onChange={(newValue) => setValue(newValue)}
        reduceAnimations
        renderInput={
          (startProps, endProps) => (
            <>
              <TextField
                {...startProps}
                classes={
                  {
                    root: classes.textFieldRoot,
                  }
                }
                error={false}
                helperText={null}
                InputLabelProps={
                  {
                    shrink: true,
                  }
                }
                inputRef={startDateRef}
                size="small"
              />
              <DateRangeDelimiter
                classes={
                  {
                    root: classes.delimiterRoot,
                  }
                }
              >
                <FormattedMessage defaultMessage="a" id="common.to"/>
              </DateRangeDelimiter>
              <TextField
                {...endProps}
                classes={
                  {
                    root: classes.textFieldRoot,
                  }
                }
                error={false}
                helperText={null}
                InputLabelProps={
                  {
                    shrink: true,
                  }
                }
                inputRef={endDateRef}
                size="small"
              />
            </>
          )
        }
        startText={intl.formatMessage(messages['date_range_start'])}
        toolbarTitle={intl.formatMessage(messages['date_range_select_title'])}
        value={value}
      />
    </>
  )
}

export default DatePickerField
