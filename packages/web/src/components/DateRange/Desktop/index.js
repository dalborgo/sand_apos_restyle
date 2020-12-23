import React, { useRef } from 'react'
import TextField from '@material-ui/core/TextField'
import { Collapse, makeStyles } from '@material-ui/core'
import { DateRangeDelimiter, DateRangePicker } from '@material-ui/pickers'
import { FormattedMessage, useIntl } from 'react-intl'
import moment from 'moment'
import { messages } from 'src/translations/messages'
import useSettings from 'src/hooks/useSettings'
import { maskMap } from 'src/translations'

const useStyles = makeStyles(theme => ({
  delimiterRoot: {
    color: theme.palette.action.active,
  },
  textFieldRoot: {
    backgroundColor: theme.palette.background.default,
  },
}))

const DatePickerField = ({
  endDateRef,
  field: { value, name },
  form,
  open,
  setDateRange,
  setOpen,
  startDateRef,
  ...other
}) => {
  const [startDate, endDate] = value
  const disabledEnd = !startDate && (!open || (open && !startDate)) //disabilitare endDate con la popup aperta fa crashare se valorizzato
  const classes = useStyles()
  const { settings: { locale } } = useSettings()
  const intl = useIntl()
  const prevStart = useRef(null)
  const prevEnd = useRef(null)
  return (
    <DateRangePicker
      disableAutoMonthSwitching
      disableFuture
      endText={intl.formatMessage(messages.date_range_end)}
      mask={maskMap[locale]}
      onAccept={
        date => {
          prevStart.current = date[0]
          setDateRange(date)
        }
      }
      onChange={
        date => {
          const [startDate, endDate] = date
          const isSameDate = moment(startDate).isSame(prevStart.current) && moment(startDate).isSame(endDate) && !moment(endDate).isSame(prevEnd.current)
          if (isSameDate) {
            setOpen(false)
            setDateRange(date)
          }
          prevStart.current = startDate
          prevEnd.current = endDate
          form.setFieldValue(name, date, false)
        }
      }
      onClose={() => {setOpen(false)}}
      open={open}
      reduceAnimations
      renderInput={
        (startDateProps, endDateProps) => (
          <>
            <TextField
              {...startDateProps}
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
              onFocus={
                event => {
                  if (!open) {
                    setOpen(true)
                    event.target.select()
                  }
                }
              }
              size="small"
            />
            <DateRangeDelimiter
              classes={
                {
                  root: classes.delimiterRoot,
                }
              }
            ><FormattedMessage defaultMessage="a" id="common.to"/>
            </DateRangeDelimiter>
            <TextField
              {...endDateProps}
              classes={
                {
                  root: classes.textFieldRoot,
                }
              }
              disabled={disabledEnd}
              error={false}
              helperText={null}
              InputLabelProps={
                {
                  shrink: true,
                }
              }
              inputProps={
                {
                  ...endDateProps.inputProps,
                  disabled: disabledEnd, //disabilita l'interno del campo
                }
              }
              inputRef={endDateRef}
              onFocus={
                event => {
                  if (endDate && !open) {
                    setOpen(true)
                    event.target.select()
                  }
                }
              }
              size="small"
            />
          </>
        )
      }
      startText={intl.formatMessage(messages.date_range_start)}
      TransitionComponent={Collapse}
      value={value}
      {...other}
    />
  )
}

export default DatePickerField
