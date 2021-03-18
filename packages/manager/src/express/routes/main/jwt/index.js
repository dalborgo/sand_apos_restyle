import jwt from 'jsonwebtoken-refresh'
import { couchQueries } from '@adapter/io'
import config from 'config'
import log from '@adapter/common/src/winston'
import get from 'lodash/get'

const { utils } = require(__helpers)

const { MAXAGE_MINUTES = 30, AUTH = 'boobs' } = config.get('express')
const JWT_SECRET = AUTH
const JWT_EXPIRES_IN = `${MAXAGE_MINUTES} minutes`

const setPriority = role => {
  switch (role) {
    case 'admin':
      return 4
    default:
      return 3
  }
}

function selectUserFields (identity) {
  return {
    display: identity.user,
    morse: identity.morse,
    priority: setPriority(identity.role),
  }
}

function getQueryUserFields () {
  return '`user`.`user`, `user`.`role`, `user`.`type`, `user`.`morse`, `user`.`locales` '// lascia ultimo spazio
}

function getQueryGcFields () {
  return 'customize_stelle_options.update_from_app hotelEnabled '// lascia ultimo spazio
}

function getGcs (codes, gsResponse) {
  let count = 0
  const response = get(gsResponse, 'results', [])
  return codes.reduce((prev, curr) => {
    prev[curr.code] = response[count++]
    return prev
  }, {})
}

function getGcsPromises (connClass, codes, init = []) {
  const promises = init
  const ids = codes.map(code => `general_configuration_${code.code}`)
  const query = 'SELECT '
                + getQueryGcFields()
                + 'FROM `' + connClass.astenposBucketName + '` USE KEYS ' + JSON.stringify(ids) + ' '
  promises.push(couchQueries.exec(query, connClass.cluster))
  return promises
}

function addRouters (router) {
  router.post('/jwt/login', async function (req, res) {
    const { connClass, route: { path } } = req
    const { username, password, code } = req.body
    const query = 'SELECT ARRAY object_remove(setup, "type", "profile", "p2pPassword", "p2pUser", "sgPassword", "sgUser") '
                  + 'FOR setup IN setups END AS codes, '
                  + getQueryUserFields() + ', meta(`user`).id _id '
                  + 'FROM `' + connClass.astenposBucketName + '` `user` '
                  + 'LEFT NEST `' + connClass.astenposBucketName + '` setups '
                  + 'ON KEYS ARRAY "INSTALLATION|" || TO_STRING(code) FOR code IN `user`.codes END '
                  + 'WHERE `user`.type = "USER_MANAGER" '
                  + 'AND LOWER(`user`.`user`) = $1 '
                  + 'AND `user`.`password` = $2'
    
    const {
      ok,
      results,
      message,
      err,
    } = await couchQueries.exec(query, connClass.cluster, { parameters: [username.toLowerCase().trim(), String(password).trim()] })
    if (!ok) {
      log.error('path', path)
      throw Error(err.context ? err.context.first_error_message : message)
    }
    if (!results.length) {
      return res.status(400).send({ code: 'LOGIN_WRONG_CREDENTIALS' })
    }
    const [identity] = results
    const codes = code ? [code] : identity.codes
    const promises = getGcsPromises(connClass, codes)
    const [gsResponse] = await Promise.all(promises)
    const accessToken = jwt.sign(
      { userId: identity._id, codes },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
    res.send({
      accessToken,
      codes,
      gc: getGcs(codes, gsResponse),
      locales: identity.locales || [],
      user: {
        ...selectUserFields(identity),
      },
    })
  })
  router.get('/jwt/me', async function (req, res) {
    const { connClass, route: { path } } = req
    const { authorization } = req.headers
    const accessToken = authorization.split(' ')[1]
    const { userId, codes } = jwt.verify(accessToken, JWT_SECRET)
    const query = 'SELECT '
                  + getQueryUserFields()
                  + 'FROM `' + connClass.astenposBucketName + '` `user` USE KEYS "' + userId + '"'
    const promises = getGcsPromises(connClass, codes, [couchQueries.exec(query, connClass.cluster)])
    const [userResponse, gsResponse] = await Promise.all(promises)
    {
      const { ok, results, message, err } = userResponse
      if (!ok) {
        log.error('Path', path)
        throw Error(err.context ? err.context.first_error_message : message)
      }
      if (!results.length) {
        return res.status(400).send({ message: 'Wrong authentication code!' })
      }
    }
    const [identity] = userResponse.results
    res.send({
      accessToken,
      codes,
      gc: getGcs(codes, gsResponse),
      locales: identity.locales || [],
      user: {
        ...selectUserFields(identity),
      },
    })
  })
  router.get('/jwt/codes', async function (req, res) {
    const { connClass, route: { path } } = req
    const query = `select RAW OBJECT_REMOVE(buc, 'type') from \`${connClass.astenposBucketName}\` buc where type = "INSTALLATION"`
    const { ok, results, message, err } = await couchQueries.exec(query, connClass.cluster)
    if (!ok) {
      log.error('Path', path)
      throw Error(err.context ? err.context.first_error_message : message)
    }
    res.send(results)
  })
  router.get('/jwt/check_session', async function (req, res) {
    utils.checkSecurity(req)
    res.send({ ok: true })
  })
  router.get('/jwt/refresh_token', async function (req, res) {
    const { authorization } = req.headers
    const accessToken = authorization.split(' ')[1]
    const newAccessToken = jwt.refresh(accessToken, JWT_EXPIRES_IN, JWT_SECRET)
    res.send({ ok: true, results: newAccessToken })
  })
}

export default {
  addRouters,
}
