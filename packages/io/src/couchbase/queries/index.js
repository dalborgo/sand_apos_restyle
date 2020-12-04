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
    log.debug('query', statement)
    const { meta, rows } = await cluster.query(statement, options)
    log.debug('executionTime', `${meta.metrics.executionTime} ms`)
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
  const { HOST, PASSWORD, BUCKET_NAME } = connection
  const auth = cFunctions.getAuth(BUCKET_NAME, PASSWORD)
  try {
    const params = {
      data: {
        ...options,
        statement,
      },
      headers: { Authorization: auth },
      method: 'POST',
      url: `http://${HOST}:8093/query/service`,
    }
    log.verbose('query service', statement)
    const { data: { results } } = await axios(params)
    log.verbose('end query service execution') //metrics non attendibili
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
