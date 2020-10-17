import { couchServer, couchViews } from '@adapter/io'

const { axios } = require(__helpers)

async function addRouters (router) {
  router.get('/info/sync_gateway', async function (req, res) {
    const { connClass = {} } = req
    const { data: results } = await axios.restApiInstance(connClass.host)('/')
    res.send({ ok: true, results })
  })
  router.get('/info/couch_server', async function (req, res) {
    const { connJSON = {} } = req
    const response = await couchServer.getVersion(connJSON)
    res.send(response)
  })
  router.get('/info/browser', async function (req, res) {
    const { connClass = {} } = req
    const params = {
      view: 'list_docs_all2'
    }
    const response = await couchViews.execViewService(params, connClass.astConnection)
    res.send(response)
  })
}

export default {
  addRouters,
}
