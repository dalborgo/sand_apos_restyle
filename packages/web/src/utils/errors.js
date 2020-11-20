import log from '@adapter/common/src/log'

export function expandError (err) {
  const { message, response = {}, request = {} } = err
  const requestStatus = request.status
  log.error(message)
  const { data: responseData, status: responseStatus } = response
  const isNetworkError = requestStatus === 0 || responseStatus === 503
  return {
    isNetworkError,
    message,
    requestStatus,
    responseData,
    responseStatus,
  }
}
