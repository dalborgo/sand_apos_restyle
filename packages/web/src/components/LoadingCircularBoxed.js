import React from 'react'
import { Box, CircularProgress } from '@material-ui/core'

function LoadingCircularBoxed () {
  return (
    <Box
      alignItems="center"
      display="flex"
      height="100%"
      justifyContent="center"
    >
      <CircularProgress/>
    </Box>
  )
}

export default LoadingCircularBoxed
