export class BadRequest extends Error {
  constructor (message = 'Bad Request') {
    super(message)
    this.status = 400
  }
}

export class Unauthorized extends Error {
  constructor (message = 'Unauthorized') {
    super(message)
    this.status = 401
  }
}

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
  BadRequest,
  throwCustomError,
  throwError,
  Unauthorized,
}
