import React, { memo, Suspense } from 'react'
import { useSnackbar } from 'notistack'
import { ErrorBoundary } from 'react-error-boundary'
import LoadingCircularBoxed from './LoadingCircularBoxed'
import PropTypes from 'prop-types'

const ErrorSuspenseWrapper = memo(function ErrorSuspenseWrapper ({ message, children, variant, fallback }) {
  const { enqueueSnackbar } = useSnackbar()
  return (
    <ErrorBoundary
      FallbackComponent={() => null}
      onError={error => {enqueueSnackbar(message || error.message, { variant })}}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
})
ErrorSuspenseWrapper.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'error', 'warning']),
}

ErrorSuspenseWrapper.defaultProps = {
  fallback: <LoadingCircularBoxed/>,
  variant: 'error',
}

export default ErrorSuspenseWrapper
