import React, { memo } from 'react'
import { AppBar, Box, Hidden, IconButton, makeStyles, SvgIcon, TextField, Toolbar } from '@material-ui/core'
import { Menu as MenuIcon } from 'react-feather'
import { THEMES } from 'src/constants'
import Account from './Account'
/*import Contacts from './Contacts'
import Notifications from './Notifications'
import Search from './Search'*/
import Settings from './Settings'
import useAuth from 'src/hooks/useAuth'
import useSettings from 'src/hooks/useSettings'
import { capitalCase } from 'change-case'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { NO_SELECTED_CODE } from 'src/contexts/JWTAuthContext'

const useStyles = makeStyles(theme => ({
  root: {
    zIndex: theme.zIndex.drawer + 100,
    ...theme.name === THEMES.LIGHT ?
      {
        boxShadow: 'none',
        backgroundColor: theme.palette.primary.main,
      }
      : {},
    ...theme.name === THEMES.ONE_DARK ?
      {
        backgroundColor: theme.palette.background.default,
      }
      : {},
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  inputRoot: {
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
  },
  toolbar: {
    minHeight: 64,
    [theme.breakpoints.down('sm')]: {
      minHeight: 32,
    },
  },
}))

const optionBg = {
  backgroundColor: '#7973EF',
}

const TopBar = ({
  setMobileNavOpen,
}) => {
  const { codes, selectedCode = { code: NO_SELECTED_CODE }, changeCode } = useAuth()
  const classes = useStyles()
  const intl = useIntl()
  const { settings } = useSettings()
  const isLight = settings.theme === 'LIGHT'
  return (
    <AppBar
      className={classes.root}
    >
      <Toolbar className={classes.toolbar}>
        <Hidden lgUp>
          <IconButton
            color="inherit"
            onClick={() => setMobileNavOpen(true)}
          >
            <SvgIcon fontSize="small">
              <MenuIcon/>
            </SvgIcon>
          </IconButton>
        </Hidden>
        {
          codes?.length &&
          <TextField
            InputProps={
              {
                classes: {
                  root: isLight ? classes.inputRoot : undefined,
                },
              }
            }
            name="code"
            onChange={
              event => {
                event.persist()
                const value = event.target.value
                changeCode(value)
              }
            }
            select
            SelectProps={
              {
                native: true,
              }
            }
            size="small"
            value={selectedCode.code}
            variant="outlined"
          >
            {
              codes.length > 1 &&
              <option
                style={isLight ? optionBg : undefined}
                value={NO_SELECTED_CODE}
              >
                {intl.formatMessage(messages.common_all)}
              </option>
            }
            {
              codes.map(({code, name}) => (
                <option
                  key={code}
                  style={isLight ? optionBg : undefined}
                  value={code}
                >
                  {capitalCase(name)}
                </option>
              ))
            }
          </TextField>
        }
        <Box
          flexGrow={1}
          ml={2}
        />
        {/*<Search/>
        <Contacts/>
        <Notifications/>*/}
        <Settings/>
        <Box ml={2}>
          <Account/>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default memo(TopBar)
