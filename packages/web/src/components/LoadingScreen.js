import React from 'react'
import { LinearProgress, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(() => ({
  root: {},
}))

const LoadingScreen = () => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <LinearProgress/>
    </div>
  )
}

export default LoadingScreen
