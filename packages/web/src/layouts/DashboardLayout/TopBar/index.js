import React, { memo } from 'react'
import { AppBar, Box, Hidden, IconButton, makeStyles, SvgIcon, Toolbar, Typography } from '@material-ui/core'
import { Menu as MenuIcon } from 'react-feather'
import { THEMES } from 'src/constants'
import Account from './Account'
import Contacts from './Contacts'
import Notifications from './Notifications'
import Search from './Search'
import Settings from './Settings'

const useStyles = makeStyles((theme) => ({
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
  toolbar: {
    minHeight: 64,
    [theme.breakpoints.down('sm')]: {
      minHeight: 32,
    },
  },
}))

const TopBar = ({
  setMobileNavOpen,
}) => {
  const classes = useStyles()
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
        <Typography variant={'h3'}>
          Asten Demo
        </Typography>
        <Box
          flexGrow={1}
          ml={2}
        />
        <Search/>
        <Contacts/>
        <Notifications/>
        <Settings/>
        <Box ml={2}>
          <Account/>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default memo(TopBar)
