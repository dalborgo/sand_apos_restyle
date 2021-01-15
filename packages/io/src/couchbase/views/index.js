import { cFunctions } from '@adapter/common'
import axios from 'axios'
import log from '@adapter/common/src/winston'
import couchbase from 'couchbase'

const VIEW_SCAN_CONSISTENCY = {
  NotBounded: couchbase.ViewScanConsistency.NotBounded,
  RequestPlus: couchbase.ViewScanConsistency.RequestPlus,
  UpdateAfter: couchbase.ViewScanConsistency.UpdateAfter,
}

async function execService (params, connection = {}) {
  const { HOST, PASSWORD, BUCKET_NAME } = connection
  const { ddoc, view, protocol = 'http', ...rest } = params
  const params_ = { stale: false, ...rest }
  const auth = cFunctions.getAuth(BUCKET_NAME, PASSWORD)
  const port = protocol === 'http' ? 8092 : 18092
  try {
    const queryString = cFunctions.objToQueryString(params_)
    const url = `${protocol}://${HOST}:${port}/${BUCKET_NAME}/_design/${ddoc || BUCKET_NAME}/_view/${view}?${queryString}`
    log.debug('url view', url)
    const params = {
      headers: { Authorization: auth },
      url,
    }
    log.verbose('Start exec service view')
    const { data: results } = await axios(params)
    log.verbose('End exec service view')
    return { ok: true, results }
  } catch (err) {
    log.error(err)
    return { ok: false, err, message: err.message }
  }
}

/**
 *
 * @param designDoc
 * @param viewName
 * @param bucket: type connection
 * @param options_: {scanConsistency: }
 * - [Views](https://docs.couchbase.com/server/6.5/learn/views/views-querying.html)
 * - [Views SDK](https://docs.couchbase.com/nodejs-sdk/current/howtos/view-queries-with-sdk.html)
 * - [Views API](https://docs.couchbase.com/sdk-api/couchbase-node-client-3.0.6/Bucket.html#viewQuery)
 */
async function exec (designDoc, viewName, bucket, options_ = {}) {
  const options = Object.assign({ scanConsistency: VIEW_SCAN_CONSISTENCY.RequestPlus }, options_)
  try {
    log.verbose('Start exec view')
    const results = await bucket.viewQuery(designDoc, viewName, options)
    log.verbose('End exec view')
    if (results.meta) { // for shape consistency with the execService "results"
      results.total_rows = results.meta.total_rows
      results.meta = undefined
    }
    return { ok: true, results }
  } catch (err) {
    log.error(err)
    return { ok: false, err, message: err.message }
  }
}

export default {
  VIEW_SCAN_CONSISTENCY,
  exec,
  execService,
}
