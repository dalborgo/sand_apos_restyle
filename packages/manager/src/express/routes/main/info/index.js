import { couchServer } from '@adapter/io'

const { axios } = require(__helpers)

async function addRouters (router) {
  router.get('/info/sync_gateway', async function (req, res) {
    const { connections = {} } = req
    const { data: results } = await axios.restApiInstance(connections.host)('/')
    res.send({ ok: true, results })
  })
  router.get('/info/couch_server', async function (req, res) {
    const { connObj = {} } = req
    const response = await couchServer.getVersion(connObj)
    res.send(response)
  })
}

export default {
  addRouters,
}
