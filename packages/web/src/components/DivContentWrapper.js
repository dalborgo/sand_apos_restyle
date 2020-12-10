import React from 'react'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    flexShrink: 1,
    display: 'flex',
    overflowY: 'hidden',
    overflowX: 'auto',
  },
  innerFirst: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      padding: 0,
    },
  },
}))
const DivContentWrapper = ({ children }) => {
  const classes = useStyles()
  return (
    <div className={classes.content}>
      <div className={classes.innerFirst}>
        {children}
      </div>
    </div>
  )
}

export default DivContentWrapper
