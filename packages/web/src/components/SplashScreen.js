import React from 'react'
import { Box, LinearProgress, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    left: 0,
    position: 'fixed',
    top: 0,
    width: '100%',
    zIndex: 2000,
  },
}))

const SplashScreen = () => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <Box width="50%">
        <LinearProgress />
      </Box>
    </div>
  )
}

export default SplashScreen
