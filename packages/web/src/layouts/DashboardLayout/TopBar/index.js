import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  AppBar,
  Box,
  Hidden,
  IconButton,
  makeStyles,
  SvgIcon,
  TextField,
  Toolbar,
  Typography,
  useTheme,
} from '@material-ui/core'
import { Menu as MenuIcon } from 'react-feather'
import { THEMES } from 'src/constants'
import Account from './Account'
import startCase from 'lodash/startCase'
import Settings from './Settings'
import useAuth from 'src/hooks/useAuth'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { NO_SELECTED_CODE } from 'src/contexts/JWTAuthContext'
import useGeneralStore from 'src/zustandStore/useGeneralStore'
import shallow from 'zustand/shallow'

const useStyles = makeStyles(theme => ({
  root: {
    zIndex: theme.zIndex.drawer + 100,
    ...theme.name === THEMES.light ?
      {
        boxShadow: 'none',
        backgroundColor: theme.palette.primary.main,
      }
      : {},
    ...theme.name === THEMES.one_dark ?
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
    color: theme.palette.secondary.contrastText,
    backgroundColor: 'none',
    ...theme.typography.h4,
  },
  iconOutlined: {
    color: theme.palette.secondary.contrastText,
  },
  select: {
    '&:focus': {
      backgroundColor: theme.name === THEMES.light ? theme.palette.primary.main : theme.palette.background.default,
    },
    paddingLeft: 0,
  },
  inputNotchedOutline: {
    border: 0,
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

function calculateMorse (morseState, user, switchAllIn, allin) {
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

const generalSel = state => ({
  allIn_: state.allIn,
  switchAllIn: state.switchAllIn,
})
const TopBar = ({
  setMobileNavOpen,
}) => {
  const { codes, selectedCode = { code: NO_SELECTED_CODE }, changeCode, user } = useAuth()
  const theme = useTheme()
  const optionBg = useMemo(() => {
    return {
      ...theme.typography.h5,
      ...theme.name === THEMES.light ? { backgroundColor: theme.palette.secondary.main } : {},
    }
  }, [theme.name, theme.palette.secondary.main, theme.typography.h5])
  const classes = useStyles()
  const { switchAllIn, allIn_ } = useGeneralStore(generalSel, shallow)
  const intl = useIntl()
  const divRef = useRef(null)
  const morseState = useRef({ count: 0, time: 0, serie: 0 })
  const handleMorse = useCallback(() => {
    calculateMorse(morseState, user, switchAllIn, allIn_)
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
          codes?.length > 1 ?
            <TextField
              InputProps={
                {
                  classes: {
                    root: classes.inputRoot,
                    notchedOutline: classes.inputNotchedOutline,
                  },
                }
              }
              name="code"
              onChange={
                event => {
                  const value = event.target.value
                  changeCode(value)
                }
              }
              onFocus={() => null}
              select
              SelectProps={
                {
                  native: true,
                  classes: {
                    iconOutlined: classes.iconOutlined,
                    select: classes.select,
                  },
                }
              }
              size="small"
              value={selectedCode.code}
              variant="outlined"
            >
              <option
                style={optionBg} //non riesco con il className
                value={NO_SELECTED_CODE}
              >
                {intl.formatMessage(messages.common_all)}
              </option>
              {
                codes.map(({ code, name }) => (
                  <option
                    key={code}
                    style={optionBg}
                    value={code}
                  >
                    {startCase(name)}
                  </option>
                ))
              }
            </TextField>
            :
            <Typography variant="h4">
              {startCase(codes?.[0].name)}
            </Typography>
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
