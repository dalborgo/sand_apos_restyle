import { email } from '@adapter/io'
import log from '@adapter/common/src/winston'
import { cFunctions } from '@adapter/common'
import { queryById } from '../queries'

const { axios, utils } = require(__helpers)

function getSignUpMail (name, code) {
  return `<pre>Conferma registrazione struttura: ${name}
Codice Login: ${code}
</pre>`
}

function addRouters (router) {
  router.post('/installations/login', async function (req, res) {
  
  })
  router.post('/installations/loginQR', async function (req, res) {
  
  })
  router.post('/installations/sendInstallationCode', async function (req, res) {
    const { body } = req
    utils.controlParameters(body, ['code'])
    
  })
  router.post('/installations/signup', async function (req, res) {
    const { body } = req
    utils.controlParameters(body, ['iva', 'password', 'ragSoc'])
    const { data } = await axios.localInstance.post('/queries/query_by_type', {
      type: 'INSTALLATION',
      columns: ['iva', 'name', 'code'],
      where: { iva: body.iva },
    })
    const partial = {}
    {
      const { ok, message, results, err } = data
      if (!ok) {return res.send({ ok, message, err, errorCode: err.code || 500 })}
      partial.installations = results || []
    }
    if (!body.forceNew) {
      if (partial.installations.length) {
        const results = {}
        for (let installation of partial.installations) {
          results[installation.code] = installation.name
        }
        return res.send({ ok: true, results })
      }
    }
    const { connClass } = req
    const getUUID = cFunctions.getUUID()
    const code = cFunctions.generateString()
    const password = getUUID()
    {
      const connection = { HOST: connClass.host, PORT: 4985 }
      //serve lo slash in fondo
      const { data } = await axios.restApiInstance(connection).post(`/${connClass.astenposBucketName}/_user/`, {
        name: code,
        password,
        admin_channels: ['*'],
      })
      log.debug('Response apiRest', data)
    }
    // eslint-disable-next-line no-unused-vars
    const { forceNew, ...profile } = body
    const toSave = {
      code,
      p2pPassword: getUUID(),
      p2pUser: `${code}${getUUID()}`,
      password: body.password,
      profile,
      sgPassword: password,
      sgUser: code,
      type: 'INSTALLATION',
    }
    {
      const { astenposBucketCollection: collection } = connClass
      const data = await collection.insert(`INSTALLATION|${code}`, toSave)
      log.debug('Response insert', data)
    }
    const destination = cFunctions.isProd() ? body.email : 'support@astenpos.it'
    const response = await email.send(destination, 'Next Astenpos - Conferma Registrazione', getSignUpMail(body.name, code))
    log.debug('Response nodemailer', response)
    res.send({ ok: true })
  })
}

export default {
  addRouters,
}
