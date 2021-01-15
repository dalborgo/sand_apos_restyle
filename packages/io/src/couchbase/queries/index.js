import log from '@adapter/common/src/winston'
import couchbase from 'couchbase'
import axios from 'axios'
import { cFunctions } from '@adapter/common'
import get from 'lodash/get'

const QUERY_SCAN_CONSISTENCY = {
  NotBounded: couchbase.QueryScanConsistency.NotBounded,
  RequestPlus: couchbase.QueryScanConsistency.RequestPlus,
}

/**
 * @options_ es. { parameters: { type: 'USER' }, scanConsistency: ... }
 */
async function exec (statement, cluster, options_ = {}) {
  const options = Object.assign({}, options_)
  try {
    log.debug('Query', statement)
    const { meta, rows } = await cluster.query(statement, options)
    log.debug('ExecutionTime', `${meta.metrics.executionTime} ms`)
    return { ok: true, results: rows }
  } catch (err) {
    log.error('Query error', err)
    return { ok: false, message: err.message, err }
  }
}
/**
 * @options es. { args: [ "smith", 45 ], scan_consistency: ... }
 * DOC:
 * - [N1Ql rest api](https://docs.couchbase.com/server/current/n1ql/n1ql-rest-api/index.html)
 */
async function execByService (statement, connection = {}, options = {}) {
  const { HOST, PASSWORD, BUCKET_NAME, SERVICE_REST_PROTOCOL = 'http' } = connection
  const auth = cFunctions.getAuth(BUCKET_NAME, PASSWORD)
  const port = SERVICE_REST_PROTOCOL === 'http' ? '8093' : '18093'
  const url = `${SERVICE_REST_PROTOCOL}://${HOST}:${port}/query/service`
  log.debug('Query service url', url)
  try {
    const params = {
      data: {
        ...options,
        statement,
      },
      headers: { Authorization: auth },
      method: 'POST',
      url,
    }
    log.verbose('Query service', statement)
    const { data: { results } } = await axios(params)
    log.verbose('End query service execution') //metrics non attendibili
    return { ok: true, results }
  } catch (err) {
    const info = get(err, 'response.data.errors')
    log.error('Query service error', err)
    return { ok: false, message: err.message, info }
  }
}

export default {
  QUERY_SCAN_CONSISTENCY,
  exec,
  execByService,
}
