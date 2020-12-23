import React, { useRef, useState } from 'react'
import { Link as RouterLink, useHistory } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { Avatar, Box, ButtonBase, Hidden, makeStyles, Menu, MenuItem, Typography } from '@material-ui/core'
import useAuth from 'src/hooks/useAuth'
import log from '@adapter/common/src/log'
const useStyles = makeStyles((theme) => ({
  avatar: {
    height: 32,
    width: 32,
    marginRight: theme.spacing(1),
  },
  popover: {
    width: 200,
  },
}))

const Account = () => {
  const classes = useStyles()
  const history = useHistory()
  const ref = useRef(null)
  const { user, logout } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [isOpen, setOpen] = useState(false)
  
  const handleOpen = () => {
    setOpen(true)
  }
  
  const handleClose = () => {
    setOpen(false)
  }
  
  const handleLogout = async () => {
    try {
      handleClose()
      await logout()
      history.push('/')
    } catch (err) {
      log.error(err)
      enqueueSnackbar('Unable to logout')
    }
  }
  
  return (
    <>
      <Box
        alignItems="center"
        component={ButtonBase}
        display="flex"
        onClick={handleOpen}
        ref={ref}
      >
        <Avatar
          alt="User"
          className={classes.avatar}
          src={`/static/images/avatars/${user.priority}.png`}
        />
        <Hidden smDown>
          <Typography
            color="inherit"
            variant="h6"
          >
            {user.display}
          </Typography>
        </Hidden>
      </Box>
      <Menu
        anchorEl={ref.current}
        anchorOrigin={
          {
            vertical: 'bottom',
            horizontal: 'center',
          }
        }
        getContentAnchorEl={null}
        keepMounted
        onClose={handleClose}
        open={isOpen}
        PaperProps={{ className: classes.popover }}
      >
        <MenuItem
          component={RouterLink}
          to="/app/social/profile"
        >
          Profile
        </MenuItem>
        <MenuItem
          component={RouterLink}
          to="/app/account"
        >
          Account
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          Logout
        </MenuItem>
      </Menu>
    </>
  )
}

export default Account
