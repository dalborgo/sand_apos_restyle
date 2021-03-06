import jwt from 'jsonwebtoken-refresh'
import config from 'config'
import keyBy from 'lodash/keyBy'
import { cFunctions } from '@adapter/common'
import { connections } from '../'

const { Unauthorized } = require(__errors)
const { AUTH = 'boobs' } = config.get('express')
const JWT_SECRET = AUTH

function hasAuthorization (headers, checkCodes = []) {
  if (connections.isInternal(headers) || !cFunctions.isProd()) {return}
  const { authorization } = headers
  if (!authorization) {throw new Unauthorized()}
  const accessToken = authorization.split(' ')[1]
  const { codes } = jwt.verify(accessToken, JWT_SECRET)
  const codesByKey = keyBy(codes, 'code')
  for (let code of checkCodes) {
    if (!codesByKey[code]) {
      throw new Unauthorized()
    }
  }
}

export default {
  hasAuthorization,
}
