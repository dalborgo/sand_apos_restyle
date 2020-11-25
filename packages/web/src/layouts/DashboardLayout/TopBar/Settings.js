import React, { useRef, useState } from 'react'
import { capitalCase } from 'change-case'
import {
  Badge,
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

const useStyles = makeStyles((theme) => ({
  badge: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginTop: 10,
    marginRight: 5,
  },
  popover: {
    width: 320,
    padding: theme.spacing(2),
  },
}))

const Settings = () => {
  const classes = useStyles()
  const ref = useRef(null)
  const { settings, saveSettings } = useSettings()
  const [isOpen, setOpen] = useState(false)
  const [values, setValues] = useState({
    locale: 'it', //todo create menu to select locale
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
      <Tooltip title="Settings">
        <Badge
          classes={{ badge: classes.badge }}
          color="secondary"
          variant="dot"
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
        </Badge>
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
          Settings
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
            label="Responsive font sizes"
          />
        </Box>
        <Box mt={2}>
          <TextField
            fullWidth
            label="Theme"
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
            Save Settings
          </Button>
        </Box>
      </Popover>
    </>
  )
}

export default Settings
