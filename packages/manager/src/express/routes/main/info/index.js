import { couchServer, couchViews } from '@adapter/io'

const { axios } = require(__helpers)

async function addRouters (router) {
  router.get('/info/sync_gateway', async function (req, res) {
    const { connClass = {} } = req
    const { data } = await axios.restApiInstance(connClass.host)('/')
    res.send(data)
  })
  router.get('/info/couch_server', async function (req, res) {
    const { connJSON = {} } = req
    const data = await couchServer.getVersion(connJSON)
    res.send(data)
  })
  router.get('/info/browser', async function (req, res) {
    const { connClass = {} } = req
    const params = {
      view: 'list_docs_all2',
    }
    const data = await couchViews.execViewService(params, connClass.astConnection)
    res.send(data)
  })
}

export default {
  addRouters,
}
