import jwt from 'jsonwebtoken'
import { couchQueries } from '@adapter/io'
import config from 'config'

const { MAXAGE_MINUTES = 30, AUTH = 'boobs' } = config.get('express')
const JWT_SECRET = AUTH
const JWT_EXPIRES_IN = `${MAXAGE_MINUTES} minutes`

const setPriority = type => {
  switch (type) {
    case 'USER':
      return 2
    default:
      return 3
  }
}
function selectUserFields (identity) {
  return {
    display: identity.user,
    id: identity._id,
    priority: setPriority(identity.type),
  }
}

function addRouters (router) {
  router.post('/jwt/login', async function (req, res) {
    const { connClass, route: { path } } = req
    const { username, password } = req.body
    const query = 'SELECT ast.*, meta(ast).id _id '
                  + 'FROM ' + connClass.astenposBucketName + ' ast '
                  + 'WHERE (type = "USER_ADMIN" OR type = "USER") '
                  + 'AND LOWER(`user`) = $1 '
                  + 'AND `password` = $2'
    const { ok, results, message } = await couchQueries.exec(query, connClass.cluster, { parameters: [username.toLowerCase(), password] })
    if (!ok) {return res.send({ message: `${path} - error query: ${message}` })}
    if (!results.length) {
      return res.status(400).send({ messageCode: 'LOGIN_WRONG_CREDENTIALS' })
    }
    const [identity] = results
    const accessToken = jwt.sign(
      { userId: identity._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
    res.send({
      accessToken,
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
    const query = `SELECT ast.* from ${connClass.astenposBucketName} ast USE KEYS "${userId}"`
    const { ok, results, message } = await couchQueries.exec(query, connClass.cluster)
    if (!ok) {return res.send({ message: `${path} - error query: ${message}` })}
    if (!results.length) {
      return res.status(400).send({ message: 'Wrong authentication code!' })
    }
    const [identity] = results
    res.send({
      accessToken,
      user: {
        ...selectUserFields(identity),
      },
    })
  })
}

export default {
  addRouters,
}
