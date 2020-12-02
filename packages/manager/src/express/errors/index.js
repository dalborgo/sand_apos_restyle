export class BadRequest extends Error {
  constructor (code, values = [], message = 'Bad Request') {
    super(message)
    this.status = 400
    this.code = code
    this.values = values
  }
}

export class Unauthorized extends Error {
  constructor (message = 'Unauthorized') {
    super(message)
    this.status = 401
  }
}
