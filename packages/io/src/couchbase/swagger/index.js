import Bluebird from 'bluebird'
import Swagger from 'swagger-client'
import httpMessageParser from 'http-message-parser'
import spec from './json/sgadmin20'
import { normConnection } from '../helpers'

Bluebird.config({ cancellation: true })
const SWAGGER_TIMEOUT = 120000
const API_ADMIN_PORT = '4985'

const getTimeout = (ms = SWAGGER_TIMEOUT) => new Bluebird((resolve, reject, onCancel) => {
  const id = setTimeout(resolve, ms, { ok: false, statusText: `swagger execute timeout ${ms} ms` })
  onCancel(() => clearTimeout(id))
})

const getClient = (host) => {
  spec.host = `${host}:${API_ADMIN_PORT}`
  return new Swagger({ spec }) //return promise
}

const getApis = async host => {
  const { apis } = await getClient(host)
  return apis
}

async function execute (operationId, parameters, host) {
  const timeout = getTimeout()
  try {
    const client = await getClient(host)
    const { ok, obj: results, statusText: message } = await Promise.race([client.execute({
      operationId,
      parameters,
    }), timeout])
    timeout.cancel()
    if (!ok) { return { ok, message }}
    return { ok: true, results }
  } catch ({ message }) {
    timeout.cancel()
    return { ok: false, message }
  }
}

async function executeMultiPart (operationId, parameters, arrayFirstIfError = [], objectGroup = '', host) {
  const timeout = getTimeout()
  try {
    const client = await getClient(host)
    const { ok, data, statusText: message } = await Promise.race([client.execute({
      operationId,
      parameters,
    }), timeout])
    timeout.cancel()
    if (!ok) { return { ok, message }}
    const parsedMessage = httpMessageParser(data)
    let { multipart } = parsedMessage
    multipart = multipart.length > 1 ? multipart : [parsedMessage]
    let results = objectGroup ? {} : [], cont = 0
    for (let { headers, body } of multipart) {
      const ct = headers['Content-Type']
      if (ct.startsWith('application/json')) {
        let json = JSON.parse(body.toString())
        const id = json[objectGroup] || cont++
        if (arrayFirstIfError.length && json.error && json.reason && json.status) {
          json = arrayFirstIfError[0]
        }
        if (objectGroup) {
          results[id] = json
        } else {
          results.push(json)
        }
      } else {
        const id = cont++
        if (objectGroup) {
          results[id] = body
        } else {
          results.push(body)
        }
      }
    }
    return { ok: true, results }
  } catch ({ message }) {
    timeout.cancel()
    return { ok: false, message }
  }
}

const postDbBulkDocs = async (docs, connection = {}) => {
  const { HOST, BUCKET_NAME } = normConnection(connection)
  return execute('post__db___bulk_docs', {
    db: BUCKET_NAME,
    BulkDocsBody: { docs },
  }, HOST)
}

const postDbBulkGet = async (docs, arrayFirstIfError, objectGroup, connection = {}) => {
  const { HOST, BUCKET_NAME } = normConnection(connection)
  return executeMultiPart('post__db___bulk_get', {
    db: BUCKET_NAME,
    BulkGetBody: { docs },
  }, arrayFirstIfError, objectGroup, HOST) //objectGroup if '' returns array, arrayFirstIfError is array with [0] = default undefined value
}

const getDbDoc = async (doc, connection = {}) => {
  const { HOST, BUCKET_NAME } = normConnection(connection)
  const res = await execute('get__db___doc_', {
    db: BUCKET_NAME,
    doc,
  }, HOST)
  if (res.message === 'Not Found') {res.message = `${doc} is missing!`}
  return res
}

const postDbDesignDdoc = async (views, connection = {}) => {
  const { HOST, BUCKET_NAME } = normConnection(connection)
  return execute('put__db___design__ddoc_', {
    db: BUCKET_NAME,
    ddoc: BUCKET_NAME,
    body: views,
  }, HOST)
}

export default {
  execute,
  getApis,
  getDbDoc,
  postDbBulkDocs,
  postDbBulkGet,
  postDbDesignDdoc,
}
