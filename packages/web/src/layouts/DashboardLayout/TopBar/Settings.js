import React, { useRef, useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Popover,
  Select,
  SvgIcon,
  Switch,
  Tooltip,
  Typography,
} from '@material-ui/core'
import { Settings as SettingsIcon } from 'react-feather'
import useSettings from 'src/hooks/useSettings'
import { THEMES } from 'src/constants'
import startCase from 'lodash/startCase'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { useGeneralStore } from 'src/zustandStore'
import ReactCountryFlag from 'react-country-flag'
import { to2Chars } from 'src/translations'

const useStyles = makeStyles(theme => ({
  popover: {
    width: 320,
    padding: theme.spacing(2),
  },
  tooltip: {
    marginTop:0,
  },
}))

const menuProps = {
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
  transitionDuration: 0,
  getContentAnchorEl: null,
}

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
      <Tooltip
        title={intl.formatMessage(messages['common_settings'])}
      >
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
        transitionDuration={0}
      >
        <Typography
          color="textPrimary"
          variant="h4"
        >
          {intl.formatMessage(messages['common_settings'])}
        </Typography>
        <Box
          mt={1}
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
          mt={0}
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
            <FormControl fullWidth variant="outlined">
              <InputLabel id="language_select">{intl.formatMessage(messages['common_language'])}</InputLabel>
              <Select
                label={intl.formatMessage(messages['common_language'])}
                labelId="language_select"
                MenuProps={menuProps}
                onChange={(event) => handleChange('locale', event.target.value)}
                value={values.locale}
              >
                {
                  locales.map(val => (
                    <MenuItem
                      key={val}
                      value={val}
                    >
                      <Grid container justify="space-between">
                        <Grid item>
                          {messages[`language_${val}`] ? intl.formatMessage(messages[`language_${val}`]) : ''}
                        </Grid>
                        <Grid item>
                          <ReactCountryFlag cdnUrl="/static/images/flags/" countryCode={to2Chars(val)} svg/>
                        </Grid>
                      </Grid>
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Box>
        }
        <Box mt={2}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="theme_select">{intl.formatMessage(messages['common_theme'])}</InputLabel>
            <Select
              label={intl.formatMessage(messages['common_theme'])}
              labelId="theme_select"
              MenuProps={menuProps}
              onChange={(event) => handleChange('theme', event.target.value)}
              value={values.theme}
            >
              {
                Object.keys(THEMES).map(theme => (
                  <MenuItem
                    key={theme}
                    value={theme}
                  >
                    {startCase(theme)}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
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
