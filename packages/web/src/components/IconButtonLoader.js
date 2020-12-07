import React from 'react'
import { Box, CircularProgress, IconButton, makeStyles } from '@material-ui/core'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'
import ReplayIcon from '@material-ui/icons/Replay'
import PropTypes from 'prop-types'

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'relative',
  },
  progress: {
    color: theme.palette.primary.main,
    position: 'absolute',
    top: 4,
    left: 4,
  },
}))

export default function IconButtonLoader ({ onClick, isFetching }) {
  const classes = useStyles()
  return (
    <Box className={classes.wrapper}>
      <IconButton
        color="primary"
        onClick={onClick}
      >
        {isFetching ? <HourglassEmptyIcon/> : <ReplayIcon/>}
      </IconButton>
      {isFetching && <CircularProgress className={classes.progress} size={40} thickness={2}/>}
    </Box>
  )
}

IconButtonLoader.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
}
