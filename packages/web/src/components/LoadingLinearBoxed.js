import React from 'react'
import { LinearProgress } from '@material-ui/core'
import PropTypes from 'prop-types'

function LoadingLinearBoxed ({ boxHeight }) {
  return (
    <div style={{ height: boxHeight, paddingTop: (boxHeight / 2) - 2, paddingLeft: 10, paddingRight: 10 }}>
      <LinearProgress/>
    </div>
  )
}

LoadingLinearBoxed.propTypes = {
  boxHeight: PropTypes.number.isRequired,
}

export default LoadingLinearBoxed
