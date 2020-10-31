import React, { useEffect } from 'react'
import NProgress from 'nprogress'
import { LinearProgress, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(() => ({
  root: {},
}))

const LoadingScreen = () => {
  const classes = useStyles()
  
  useEffect(() => {
    NProgress.start()
    
    return () => {
      NProgress.done()
    }
  }, [])
  
  return (
    <div className={classes.root}>
      <LinearProgress/>
    </div>
  )
}

export default LoadingScreen
