import { mailer } from '@adapter/io'
import log from '@adapter/common/src/winston'
import { cFunctions } from '@adapter/common'
import emailDefinitions from './emailDefinitions'
import get from 'lodash/get'
import { reqAuthPost } from '../../basicAuth'

const { axios, utils } = require(__helpers)

function addRouters (router) {
  router.post('/installations/login', reqAuthPost, async function (req, res) {
    const { body } = req
    utils.checkParameters(body, ['code', 'password'])
    const partial = {}
    {
      const { data } = await axios.localInstance.post('/queries/query_by_id', {
        id: `general_configuration_${body.code}`,
        owner: body.code,
        columns: ['type'],
      })
      const { ok, message, results, err = {} } = data
      if (!ok && err.code !== 404) {return res.send({ ok, message, err, errorCode: err.code || 500 })}
      partial.hasGeneralConfig = Boolean(results)
    }
    {
      const { data } = await axios.localInstance.post('/queries/query_by_id', {
        id: `INSTALLATION|${body.code}`,
      })
      const { ok, message, results, err = {} } = data
      if (!ok) {return res.send({ ok, message, err, errorCode: err.code || 500 })}
      partial.installation = results
    }
    if (partial.installation && body.password === get(partial.installation, 'profile.password')) {
      partial.results = cFunctions.flattenObj(partial.installation)
      partial.results.profile_password = undefined
      partial.results.exists = partial.hasGeneralConfig
    } else {
      return res.send({ ok: 'false', message: 'Not authorized!', errorCode: 401 })
    }
    res.send({ ok: true, results: partial.results })
  })
  router.post('/installations/sendInstallationCode', reqAuthPost, async function (req, res) {
    const { body } = req
    utils.checkParameters(body, ['code'])
    const partial = {}
    {
      const { data } = await axios.localInstance.post('/queries/query_by_id', {
        id: `INSTALLATION|${body.code}`,
        columns: ['name', 'profile.email', 'profile.state'],
      })
      const { ok, message, results, err = {} } = data
      if (!ok) {return res.send({ ok, message, err, errorCode: err.code || 500 })}
      partial.installation = results
    }
    const { email, name, state } = partial.installation
    const ed = emailDefinitions[state || 'IT']
    const destination = cFunctions.isProd() ? email : 'test@astenpos.it'
    const response = await mailer.send(destination, ed.FORGOT_MAIL.subject, ed.FORGOT_MAIL.body(name, body.code))
    log.debug('Response nodemailer', response)
    res.send({ ok: true })
  })
  router.post('/installations/signup', reqAuthPost, async function (req, res) {
    const { body } = req
    utils.checkParameters(body, ['iva', 'password', 'ragSoc', 'email'])
    const { data } = await axios.localInstance.post('/queries/query_by_type', {
      type: 'INSTALLATION',
      columns: ['profile.iva', 'name', 'code'],
      where: { 'profile.iva': body.iva },
    })
    const partial = {}
    {
      const { ok, message, results, err = {} } = data
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
      // serve lo slash in fondo
      const { data } = await axios.restApiInstance(connClass.sgAdmin, connClass.sgAdminToken).post(`/${connClass.astenposBucketName}/_user/`, {
        name: code,
        password,
        admin_channels: [code],
      })
      log.debug('Response apiRest', data)
    }
    // eslint-disable-next-line no-unused-vars
    const { forceNew, name, ...profile } = body
    const toSaveInstallation = {
      code,
      name,
      p2pPassword: getUUID(),
      p2pUser: `${code}${getUUID()}`,
      profile,
      sgPassword: password,
      sgUser: code,
      type: 'INSTALLATION',
    }
    const toSaveUserManager = {
      codes: [code],
      locales: [],
      morse: [
        2,
        2,
      ],
      password: profile.password,
      type: 'USER_MANAGER',
      user: code,
    }
    {
      const { astenposBucketCollection: collection } = connClass
      const data = await collection.insert(`INSTALLATION|${code}`, toSaveInstallation)
      log.debug('Response insert installation', data)
    }
    {
      const { astenposBucketCollection: collection } = connClass
      const data = await collection.insert(`USER_MANAGER|${code}`, toSaveUserManager)
      log.debug('Response insert user manager', data)
    }
    const destination = cFunctions.isProd() ? body.email : 'test@astenpos.it'
    const ed = emailDefinitions[body.state || 'IT']
    const response = await mailer.send(destination, ed.SIGNUP_MAIL.subject, ed.SIGNUP_MAIL.body(body.name, code))
    log.debug('Response nodemailer', response)
    res.send({ ok: true })
  })
}

export default {
  addRouters,
}
