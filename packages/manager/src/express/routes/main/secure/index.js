import { cDate, translations } from '@adapter/common'
import get from 'lodash/get'
import { couchQueries } from '@adapter/io'

const text = require(__translations)

function addRouters (router) {
  router.get('/secure/login', async function (req, res) {
    const { userId = '', password = '' } = req.query
    if (req.session.userId === userId) {return res.send({ ok: false, message: `User "${userId}" already logged in!` })}
    const { connClass } = req
    const { ok, results, message } = await couchQueries.exec(
      'Select a.`user`, a.`password` from astenpos a WHERE type = "USER" AND `user` = $1',
      connClass.cluster,
      { parameters: [userId] }
    )
    if (!ok) {return res.send({ ok, message })}
    if (results.length) {
      const [user] = results
      if (user.password !== password) {
        return res.send({ ok: false, message: translations.format(text.secure.login['wrong_password_error']) })
      }
      req.session.userId = userId
      const expires_ = get(req.session, 'cookie._expires')
      const expires = cDate.mom(expires_, null, 'YYYY-MM-DD HH:mm')
      res.send({ ok: true, results: { userId, sessionID: req.session.id, expires } })
    } else {
      res.send({ ok: false, message: translations.format(text.secure.login['user_not_found_error'], { userId }) })
    }
  })
  router.get('/secure/logout', async function (req, res) {
    const { session: { userId }, sessionID } = req
    req.session.destroy(err => {
      if (err) {return res.send({ ok: false, message: err.message, err })}
      res.clearCookie('astenposSession', { sameSite: true })
      res.send({ ok: true, results: { userId, sessionID } })
    })
  })
  router.get('/secure/me', async function (req, res) {
    const { session: { userId }, sessionID } = req
    const expires_ = get(req.session, 'cookie._expires')
    const expires = cDate.mom(expires_, null, 'YYYY-MM-DD HH:mm')
    if (userId) {
      res.send({ ok: true, results: { userId, sessionID, expires } })
    } else {
      res.send({ ok: false, message: 'No active session found!' })
    }
  })
}

export default {
  addRouters,
}
