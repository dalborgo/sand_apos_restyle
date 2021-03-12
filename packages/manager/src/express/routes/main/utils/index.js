import Q from 'q'

const soap = require('soap')
const { utils } = require(__helpers)

const CHECK_VAT_SERVICE_URL = 'http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl'

function addRouters (router) {
  router.get('/utils/fetch_vat', async function (req, res) {
    const { query } = req
    utils.checkParameters(query, ['state', 'vat'])
    const { state: countryCode = 'IT', vat: vatNumber } = query
    const client = await Q.nfcall(soap.createClient, CHECK_VAT_SERVICE_URL)
    const response = await Q.nfcall(client.checkVat, { countryCode, vatNumber })
    if (Array.isArray(response)) {
      const [results] = response
      res.send({ ok: true, results })
    } else {
      res.send({ ok: false, response })
    }
  })
}

export default {
  addRouters,
}
