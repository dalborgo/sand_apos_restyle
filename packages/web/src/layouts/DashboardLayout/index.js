import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core'
import NavBar from './NavBar'
import TopBar from './TopBar'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  wrapper: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
    paddingTop: 64,
    [theme.breakpoints.up('lg')]: {
      paddingLeft: 256,
    },
    [theme.breakpoints.down('sm')]: {
      paddingTop: 48,
    },
  },
  contentContainer: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
  },
  content: {
    flex: '1 1 auto',
    height: '100%',
    overflow: 'auto',
  },
}))

const DashboardLayout = ({ children }) => {
  const classes = useStyles()
  const [isMobileNavOpen, setMobileNavOpen] = useState(false)
  return (
    <div className={classes.root}>
      <TopBar setMobileNavOpen={setMobileNavOpen}/>
      <NavBar
        openMobile={isMobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
      />
      <div className={classes.wrapper}>
        <div className={classes.contentContainer}>
          <div className={classes.content}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
}

export default DashboardLayout
