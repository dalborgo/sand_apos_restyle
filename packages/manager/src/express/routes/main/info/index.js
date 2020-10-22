import { couchServer } from '@adapter/io'

const { axios } = require(__helpers)

function addRouters (router) {
  router.get('/info/sync_gateway', async function (req, res) {
    const { connClass } = req
    const connection = { HOST: connClass.host, PORT: 4985 }
    const { data } = await axios.restApiInstance(connection)('/')
    res.send(data)
  })
  router.get('/info/couch_server', async function (req, res) {
    const { connJSON } = req
    const data = await couchServer.getVersion(connJSON)
    res.send(data)
  })
}

export default {
  addRouters,
}
