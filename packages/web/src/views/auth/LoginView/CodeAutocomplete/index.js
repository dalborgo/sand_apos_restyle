import React, { memo } from 'react'
import { makeStyles, useTheme } from '@material-ui/styles'
import { FastField } from 'formik'
import Grid from '@material-ui/core/Grid'
import { Autocomplete } from 'material-ui-formik-components/Autocomplete'
import parse from 'autosuggest-highlight/parse'
import match from 'src/utils/matcher'
import { useQuery } from 'react-query'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'

const useStyles = makeStyles(theme => ({
  listBox: { overflowX: 'hidden' },
  formHelperText: {
    marginLeft: 14,
    marginTop: -4,
  },
  helperText: {
    position: 'absolute',
    bottom: -20,
  },
  field: {
    marginBottom: theme.spacing(2),
  },
}))

const CodeAutocomplete = memo(({ setFieldValue, setFieldTouched }) => {
  const classes = useStyles()
  const theme = useTheme()
  const intl = useIntl()
  const { data: codes = [] } = useQuery('jwt/codes', {
    suspense: true,
  })
  return (
    <FastField
      classes={
        {
          listbox: classes.listBox,
        }
      }
      component={Autocomplete}
      getOptionLabel={(option) => `${option.name} ${option.code ? `(${option.code})` : ''}`.trim()}
      getOptionSelected={(option, value) => option.code === value.code}
      name="code"
      noOptionsText="Nessuna opzione"
      onBlur={
        () => {
          setFieldTouched('code', true)
        }
      }
      onChange={
        (_, value) => {
          setFieldValue('code', value)
        }
      }
      options={codes}
      renderOption={
        (option, { inputValue }) => {
          const display = option.name
          const partsId = parse(option.code, match(option.code, inputValue))
          const partsName = parse(display, match(display, inputValue))
          return (
            <Grid alignItems="center" container>
              <Grid
                item
                xs={12}
              >
                {
                  partsName.map((part, index) => (
                    <span
                      key={index}
                      style={{ fontWeight: part.highlight ? 700 : 400 }}
                    >
                      {part.text}
                    </span>
                  ))
                }
              </Grid>
              <Grid item xs={12}>
                {
                  partsId.map((part, index) => (
                    <span
                      key={index}
                      style={
                        {
                          fontSize: '12px',
                          color: part.highlight ? theme.palette.grey[700] : theme.palette.text.secondary,
                          fontWeight: part.highlight ? 700 : 400,
                        }
                      }
                    >
                      {part.text}
                    </span>
                  ))
                }
              </Grid>
            </Grid>
          )
        }
      }
      required
      textFieldProps={
        {
          label: intl.formatMessage(messages.installation),
          variant: 'outlined',
          required: true,
          className: classes.field,
          FormHelperTextProps: {
            classes: { root: classes.helperText },
          },
        }
      }
    />
  )
})

CodeAutocomplete.displayName = 'CodeAutocomplete'

export default CodeAutocomplete
