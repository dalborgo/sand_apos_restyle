import React, { memo, useCallback, useEffect, useRef } from 'react'
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
import useGeneralStore from 'src/zustand/generalStore'

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
  toolbarRed: {
    backgroundColor: theme.palette.error.main,
  },
}))

const optionBg = {
  backgroundColor: '#7973EF',
}

function extracted (morseState, user, switchAllIn, allin) {
  let dt = new Date().getTime()
  let { count: count_, serie: serie_, time: time_ } = morseState.current
  const values = user.morse
  if (!values) {
    return
  }
  if (time_ === 0 || Math.abs(dt - time_) < 500) {
    count_ = time_ === 0 ? 1 : count_ + 1
    if (count_ === 2 && allin) { //rollback to blue
      switchAllIn()
      morseState.current = {
        count: 0,
        time: 0,
        serie: 0,
      }
      return
    } else {
      time_ = dt
    }
    if (values[serie_] === count_ && serie_ === values.length - 1) {
      switchAllIn()
      serie_ = 0
      time_ = 0
      count_ = 0
    }
  } else {
    if (values[serie_] !== count_) { //reset
      count_ = 1
      serie_ = 0
      time_ = dt
    } else {
      serie_ = serie_ + 1
      count_ = 1
      if (values[serie_] === count_) {
        switchAllIn()
        serie_ = 0
        time_ = 0
        count_ = 0
      } else {
        time_ = dt
      }
    }
  }
  morseState.current = {
    count: count_,
    time: time_,
    serie: serie_,
  }
}

const TopBar = ({
  setMobileNavOpen,
}) => {
  const { codes, selectedCode = { code: NO_SELECTED_CODE }, changeCode, user } = useAuth()
  const classes = useStyles()
  const allIn_ = useGeneralStore(state => state.allIn)
  const switchAllIn = useGeneralStore(state => state.switchAllIn)
  const intl = useIntl()
  const divRef = useRef(null)
  const morseState = useRef({ count: 0, time: 0, serie: 0 })
  const { settings } = useSettings()
  const isLight = settings.theme === 'LIGHT'
  const handleMorse = useCallback(() => {
    extracted(morseState, user, switchAllIn, allIn_)
  }, [user, switchAllIn, allIn_])
  
  useEffect(() => {
    const elem = divRef.current
    elem.addEventListener('click', handleMorse)
    return () => elem.removeEventListener('click', handleMorse)
  }, [handleMorse])
  return (
    <AppBar
      className={classes.root}
    >
      <Toolbar
        classes={
          {
            root: allIn_ ? classes.toolbarRed : undefined,
          }
        }
        className={classes.toolbar}
        id="dashboardTopBar"
        ref={divRef}
      >
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
              codes.map(({ code, name }) => (
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
