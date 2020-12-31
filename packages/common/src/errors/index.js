const throwError = (error) => {
  throw error
}

const throwCustomError = (message, code, status) => {
  const error = new Error(message)
  error.code = code
  if (status) {error.status = status}
  throw error
}

export default {
  throwCustomError,
  throwError,
}
