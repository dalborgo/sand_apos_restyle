const config = require('config')
const { NAMESPACE, AUTH } = config.get('express')
const basicAuth = require('express-basic-auth')
const unauthorizedResponse = req => {
  return req.auth
    ? { ok: false, message: `Credentials ${req.auth.user}:${req.auth.password} rejected!` }
    : { ok: false, message: 'basicAuth required!' }
}
export const reqAuthPost = AUTH
  ? basicAuth({
    users: { [NAMESPACE]: AUTH },
    unauthorizedResponse,
  })
  : (req, res, next) => next()
export const reqAuthGet = AUTH
  ? basicAuth({
    users: { [NAMESPACE]: AUTH },
    challenge: true,
  })
  : (req, res, next) => next()
