import { cDate } from '@adapter/common'
import get from 'lodash/get'

async function addRouters (router) {
  router.get('/secure/login', async function (req, res) {
    const { userId } = req.query
    if (req.session.userId === userId) {return res.send({ ok: false, message: `User "${userId}" already logged in!` })}
    req.session.userId = userId
    const expires_ = get(req.session, 'cookie._expires')
    const expires = cDate.mom(expires_, null, 'YYYY-MM-DD HH:mm')
    res.send({ ok: true, results: { userId, sessionID: req.session.id, expires } })
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
      res.send({ ok: false, message: 'No active session found for!' })
    }
  })
}

export default {
  addRouters,
}
