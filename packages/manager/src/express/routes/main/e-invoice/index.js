import config from 'config'
const { axios } = require(__helpers)

function addRouters (router) {
  router.get('/e-invoice/signin', async function (req, res) {
    const { connClass } = req
    const { data } = await axios.restApiInstance(connClass.sgPublic)('/')
    res.send(data)
  })
}

export default {
  addRouters,
}
