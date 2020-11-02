/* eslint-disable no-use-before-define */
import React, { useEffect, useMemo, useRef } from 'react'
import { Link as RouterLink, matchPath, useLocation } from 'react-router-dom'
import { PerfectScrollbarWithHotfix as PerfectScrollbar } from 'src/utils/PerfectScrollbarWithHotfix'
import PropTypes from 'prop-types'
import sections from './sections'
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  Hidden,
  Link,
  List,
  ListSubheader,
  makeStyles,
  SwipeableDrawer,
  Typography,
} from '@material-ui/core'
import useAuth from 'src/hooks/useAuth'
import NavItem from './NavItem'

function renderNavItems ({
  items,
  pathname,
  depth = 0,
}) {
  return (
    <List disablePadding>
      {
        items.reduce(
          (acc, item) => {
            if (!item.hidden) {
              return reduceChildRoutes({ acc, item, pathname, depth })
            }
            return acc
          },
          []
        )
      }
    </List>
  )
}

function reduceChildRoutes ({
  acc,
  pathname,
  item,
  depth,
}) {
  const key = item.title + depth
  
  if (item.items) {
    const open = matchPath(pathname, {
      path: item.href,
      exact: false,
    })
    
    acc.push(
      <NavItem
        depth={depth}
        icon={item.icon}
        info={item.info}
        key={key}
        open={Boolean(open)}
        title={item.title}
      >
        {
          renderNavItems({
            depth: depth + 1,
            pathname,
            items: item.items,
          })
        }
      </NavItem>
    )
  } else {
    acc.push(
      <NavItem
        depth={depth}
        exact={item.exact}
        href={item.href}
        icon={item.icon}
        info={item.info}
        key={key}
        title={item.title}
      />
    )
  }
  
  return acc
}

const useStyles = makeStyles(() => ({
  mobileDrawer: {
    width: 256,
  },
  desktopDrawer: {
    width: 256,
    top: 64,
    height: 'calc(100% - 64px)',
  },
  avatar: {
    cursor: 'pointer',
    width: 64,
    height: 64,
  },
}))

const NavBar = ({ setMobileNavOpen, openMobile }) => {
  const classes = useStyles()
  const location = useLocation()
  const { user } = useAuth()
  const PerfectScrollbarRef = useRef(null)
  const sectionList = useMemo(() => sections(user.priority), [user.priority])
  
  useEffect(() => {
    if (openMobile && setMobileNavOpen) {
      setMobileNavOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])
  
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
    >
      <PerfectScrollbar options={{ suppressScrollX: true }} ref={PerfectScrollbarRef}>
        <Box p={2}>
          <Box
            display="flex"
            justifyContent="center"
          >
            <RouterLink to="/app/account">
              <Avatar
                alt="User"
                className={classes.avatar}
                src="/static/images/avatars/avatar_6.png"
              />
            </RouterLink>
          </Box>
          <Box
            mt={2}
            textAlign="center"
          >
            <Link
              color="textPrimary"
              component={RouterLink}
              to="/app/account"
              underline="none"
              variant="h5"
            >
              {user.display}
            </Link>
            <Typography
              color="textSecondary"
              variant="body2"
            >
              Your tier:
              {' '}
              <Link
                component={RouterLink}
                to="/pricing"
              >
                {' '}
              </Link>
            </Typography>
          </Box>
        </Box>
        <Divider/>
        <Box p={2}>
          {
            sectionList.map(section => (
              <List
                key={section.subheader}
                subheader={
                  (
                    <ListSubheader
                      disableGutters
                      disableSticky
                    >
                      {section.subheader}
                    </ListSubheader>
                  )
                }
              >
                {
                  renderNavItems({
                    items: section.items,
                    pathname: location.pathname,
                  })
                }
              </List>
            ))
          }
        </Box>
        <Divider/>
        <Box p={2}>
          <Box
            bgcolor="background.dark"
            borderRadius="borderRadius"
            p={2}
          >
            <Typography
              color="textPrimary"
              variant="h6"
            >
              Need Help?
            </Typography>
            <Link
              color="secondary"
              component={RouterLink}
              to="/docs"
              variant="subtitle1"
            >
              Check our docs
            </Link>
          </Box>
        </Box>
      </PerfectScrollbar>
    </Box>
  )
  
  return (
    <>
      <Hidden lgUp>
        <SwipeableDrawer
          anchor="left"
          classes={{ paper: classes.mobileDrawer }}
          disableBackdropTransition
          hysteresis={0.01}
          onClose={() => setMobileNavOpen(false)}
          onOpen={() => setMobileNavOpen(true)}
          open={openMobile}
          style={{ touchAction: 'none' }}
          swipeAreaWidth={40}
          variant="temporary"
        >
          {content}
        </SwipeableDrawer>
      </Hidden>
      <Hidden mdDown>
        <Drawer
          anchor="left"
          classes={{ paper: classes.desktopDrawer }}
          open
          variant="persistent"
        >
          {content}
        </Drawer>
      </Hidden>
    </>
  )
}

NavBar.propTypes = {
  openMobile: PropTypes.bool,
  onMobileClose: PropTypes.func,
}

export default NavBar
