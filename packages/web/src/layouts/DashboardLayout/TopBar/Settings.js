import React, { useRef, useState } from 'react'
import { capitalCase } from 'change-case'
import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  makeStyles,
  Popover,
  SvgIcon,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core'
import { Settings as SettingsIcon } from 'react-feather'
import useSettings from 'src/hooks/useSettings'
import { THEMES } from 'src/constants'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { useGeneralStore } from 'src/zustandStore'

const useStyles = makeStyles((theme) => ({
  popover: {
    width: 320,
    padding: theme.spacing(2),
  },
}))

const Settings = () => {
  const classes = useStyles()
  const intl = useIntl()
  const ref = useRef(null)
  const locales = useGeneralStore.getState().locales
  const { settings, saveSettings } = useSettings()
  const [isOpen, setOpen] = useState(false)
  const [values, setValues] = useState({
    locale: settings.locale,
    direction: settings.direction,
    responsiveFontSizes: settings.responsiveFontSizes,
    theme: settings.theme,
  })
  
  const handleOpen = () => {
    setOpen(true)
  }
  
  const handleClose = () => {
    setOpen(false)
  }
  
  const handleChange = (field, value) => {
    setValues({
      ...values,
      [field]: value,
    })
  }
  
  const handleSave = () => {
    saveSettings(values)
    setOpen(false)
  }
  
  return (
    <>
      <Tooltip title={intl.formatMessage(messages['common_settings'])}>
        <IconButton
          color="inherit"
          onClick={handleOpen}
          ref={ref}
        >
          <SvgIcon fontSize="small">
            <SettingsIcon/>
          </SvgIcon>
        </IconButton>
      </Tooltip>
      <Popover
        anchorEl={ref.current}
        anchorOrigin={
          {
            vertical: 'bottom',
            horizontal: 'center',
          }
        }
        classes={{ paper: classes.popover }}
        onClose={handleClose}
        open={isOpen}
      >
        <Typography
          color="textPrimary"
          variant="h4"
        >
          {intl.formatMessage(messages['common_settings'])}
        </Typography>
        <Box
          mt={2}
          px={1}
        >
          <FormControlLabel
            control={
              (
                <Switch
                  checked={values.direction === 'rtl'}
                  edge="start"
                  name="direction"
                  onChange={(event) => handleChange('direction', event.target.checked ? 'rtl' : 'ltr')}
                />
              )
            }
            label="RTL"
          />
        </Box>
        <Box
          mt={2}
          px={1}
        >
          <FormControlLabel
            control={
              (
                <Switch
                  checked={values.responsiveFontSizes}
                  edge="start"
                  name="direction"
                  onChange={(event) => handleChange('responsiveFontSizes', event.target.checked)}
                />
              )
            }
            label={intl.formatMessage(messages['settings_responsive_fonts'])}
          />
        </Box>
        {
          locales.length > 1 &&
          <Box mt={2}>
            <TextField
              fullWidth
              label={intl.formatMessage(messages['common_language'])}
              name="locale"
              onChange={(event) => handleChange('locale', event.target.value)}
              select
              SelectProps={{ native: true }}
              value={values.locale}
              variant="outlined"
            >
              {
                locales.map(val => (
                  <option
                    key={val}
                    value={val}
                  >
                    {intl.formatMessage(messages[`language_${val}`])}
                  </option>
                ))
              }
            </TextField>
          </Box>
        }
        <Box mt={2}>
          <TextField
            fullWidth
            label={intl.formatMessage(messages['common_theme'])}
            name="theme"
            onChange={(event) => handleChange('theme', event.target.value)}
            select
            SelectProps={{ native: true }}
            value={values.theme}
            variant="outlined"
          >
            {
              Object.keys(THEMES).map((theme) => (
                <option
                  key={theme}
                  value={theme}
                >
                  {capitalCase(theme)}
                </option>
              ))
            }
          </TextField>
        </Box>
        <Box mt={2}>
          <Button
            color="secondary"
            fullWidth
            onClick={handleSave}
            variant="contained"
          >
            <FormattedMessage defaultMessage="Salva Impostazioni" id="toolbar.settings.save"/>
          </Button>
        </Box>
      </Popover>
    </>
  )
}

export default Settings
