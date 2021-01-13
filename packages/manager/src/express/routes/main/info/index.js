import config from 'config'
const { APK = 0 } = config.get('couchbase')
import { couchServer } from '@adapter/io'
const { axios } = require(__helpers)

function addRouters (router) {
  router.get('/info/sync_gateway', async function (req, res) {
    const { connClass } = req
    const connection = { HOST: connClass.host }
    const { data } = await axios.restApiInstance(connection)('/')
    res.send(data)
  })
  router.get('/info/couch_server', async function (req, res) {
    const { connJSON } = req
    const data = await couchServer.getVersion(connJSON)
    res.send(data)
  })
  router.get('/apk/version', async function (req, res) {
    res.send(String(APK))
  })
}

export default {
  addRouters,
}
