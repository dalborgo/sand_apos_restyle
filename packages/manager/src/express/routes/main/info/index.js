import config from 'config'
const { APK = 0 } = config.get('couchbase')
import { couchServer } from '@adapter/io'
const { axios } = require(__helpers)

function addRouters (router) {
  router.get('/info/sync_gateway', async function (req, res) {
    const { connClass } = req
    const { data } = await axios.restApiInstance(connClass.sgPublic)('/')
    res.send(data)
  })
  router.get('/info/couch_server', async function (req, res) {
    const { connClass } = req
    const data = await couchServer.getVersion(connClass)
    res.send(data)
  })
  router.get('/info/apk_version', async function (req, res) {
    res.send({ok: true, results: APK})
  })
}

export default {
  addRouters,
}
