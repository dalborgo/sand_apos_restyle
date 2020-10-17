async function addRouters (router) {
  router.get('/secure/login', async function (req, res) {
    const { userId } = req.query
    req.session.userId = userId
    res.send({ ok: true, results: { userId, sessionID: req.session.id } })
  })
  router.get('/secure/logout', async function (req, res) {
    const { session: { userId }, sessionID } = req
    req.session.destroy(function (err) {
      if (err) {
        return res.send({ ok: false, message: err.message })
      }
      res.clearCookie('astenposSession', { sameSite: true })
      res.send({ ok: true, results: { userId, sessionID } })
    })
  })
  router.get('/secure/me', async function (req, res) {
    const { session: { userId }, sessionID } = req
    if (userId) {
      res.send({ ok: true, results: { userId, sessionID } })
    } else {
      res.send({ ok: false, message: `No active session found for "${userId}"!` })
    }
  })
}

export default {
  addRouters,
}
