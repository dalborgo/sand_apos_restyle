import jwt from 'jsonwebtoken'
import { couchQueries } from '@adapter/io'
import config from 'config'
import get from 'lodash/get'
import log from '@adapter/common/src/winston'

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
function getQueryUserField () {
  return '`user`.`user`, `user`.`role`, `user`.`type`, `user`.`morse` '
}

async function getInitialData (connClass) {
  const collection = connClass.astenposBucketCollection
  const { content } = await collection.get('general_configuration')
  return {
    companyName: get(content, 'company_data.name'),
  }
}

function addRouters (router) {
  router.post('/jwt/login', async function (req, res) {
    const { connClass, route: { path } } = req
    const { username, password, code } = req.body
    const query = 'SELECT ARRAY object_remove(setup, "type") FOR setup IN setups END AS codes, '
                  + getQueryUserField()+', meta(`user`).id _id '
                  + 'FROM ' + connClass.managerBucketName + ' `user` '
                  + 'LEFT NEST ' + connClass.managerBucketName + ' setups '
                  + 'ON KEYS ARRAY "INSTALLATION|" || TO_STRING(code) FOR code IN `user`.codes END '
                  + 'WHERE `user`.type = "USER_MANAGER" '
                  + 'AND LOWER(`user`.`user`) = $1 '
                  + 'AND `user`.`password` = $2'
    
    const { ok, results, message, err } = await couchQueries.exec(query, connClass.cluster, { parameters: [username.toLowerCase().trim(), String(password).trim()] })
    if (!ok) {
      log.error('path', path)
      throw Error(err.context ? err.context.first_error_message : message)
    }
    if (!results.length) {
      return res.status(400).send({ code: 'LOGIN_WRONG_CREDENTIALS' })
    }
    const [identity] = results
    const accessToken = jwt.sign(
      { userId: identity._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
    res.send({
      accessToken,
      codes: code ? [code] : identity.codes,
      user: {
        ...selectUserFields(identity),
      },
    })
  })
  router.get('/jwt/me', async function (req, res) {
    const { connClass, route: { path } } = req
    const { authorization } = req.headers
    const accessToken = authorization.split(' ')[1]
    const { userId } = jwt.verify(accessToken, JWT_SECRET)
    const query = 'SELECT ARRAY object_remove(setup, "type") FOR setup IN setups END AS codes, '
                  + getQueryUserField()
                  + 'FROM ' + connClass.managerBucketName + ' `user` USE KEYS "' + userId + '" LEFT NEST ' + connClass.managerBucketName + ' setups '
                  + 'ON KEYS ARRAY "INSTALLATION|" || TO_STRING(code) '
                  + 'FOR code IN `user`.codes END'
    const { ok, results, message, err } = await couchQueries.exec(query, connClass.cluster)
    if (!ok) {
      log.error('path', path)
      throw Error(err.context ? err.context.first_error_message : message)
    }
    if (!results.length) {
      return res.status(400).send({ message: 'Wrong authentication code!' })
    }
    const [identity] = results
    res.send({
      accessToken,
      codes: identity.codes,
      user: {
        ...selectUserFields(identity),
      },
    })
  })
  router.get('/jwt/codes', async function (req, res) {
    const { connClass, route: { path } } = req
    const query = `select RAW OBJECT_REMOVE(man, 'type') from ${connClass.managerBucketName} man where type = "INSTALLATION"`
    const { ok, results, message, err } = await couchQueries.exec(query, connClass.cluster)
    if (!ok) {
      log.error('path', path)
      throw Error(err.context ? err.context.first_error_message : message)
    }
    res.send(results)
  })
}

export default {
  addRouters,
}
