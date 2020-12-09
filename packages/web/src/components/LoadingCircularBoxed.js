import React from 'react'
import { Box, CircularProgress } from '@material-ui/core'

function LoadingCircularBoxed ({ size }) {
  return (
    <Box
      alignItems="center"
      display="flex"
      height="100%"
      justifyContent="center"
    >
      <CircularProgress size={size}/>
    </Box>
  )
}

LoadingCircularBoxed.defaultProps = {
  size: 40,
}

export default LoadingCircularBoxed
