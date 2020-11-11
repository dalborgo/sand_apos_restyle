import jwt from 'jsonwebtoken'
import { couchQueries } from '@adapter/io'
import config from 'config'
import get from 'lodash/get'
import log from '@adapter/common/src/winston'
const { MAXAGE_MINUTES = 30, AUTH = 'boobs' } = config.get('express')
const JWT_SECRET = AUTH
const JWT_EXPIRES_IN = `${MAXAGE_MINUTES} minutes`

const setPriority = type => {
  switch (type) {
    case 'USER_MANAGER':
      return 3
    case 'USER_ADMIN':
      return 4
    default:
      return 2
  }
}

function selectUserFields (identity) {
  return {
    display: identity.user,
    id: identity._id,
    priority: setPriority(identity.type),
  }
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
    const { username, password } = req.body
    const query = 'SELECT man.*, meta(man).id _id '
                  + 'FROM ' + connClass.managerBucketName + ' man '
                  + 'WHERE (type = "USER_MANAGER" OR type = "USER_ADMIN") '
                  + 'AND LOWER(`user`) = $1 '
                  + 'AND `password` = $2'
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
      codes: identity.codes,
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
    const query = `SELECT man.* from ${connClass.managerBucketName} man USE KEYS "${userId}"`
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
}

export default {
  addRouters,
}
