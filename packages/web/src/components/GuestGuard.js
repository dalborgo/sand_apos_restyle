import React from 'react'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import useAuth from '../hooks/useAuth'

const GuestGuard = ({ children }) => {
  const { isAuthenticated } = useAuth()
  
  if (isAuthenticated) {
    return <Redirect to="/app/reports/closing-day"/>
  }
  
  return (
    <>
      {children}
    </>
  )
}

GuestGuard.propTypes = {
  children: PropTypes.node,
}

export default GuestGuard
