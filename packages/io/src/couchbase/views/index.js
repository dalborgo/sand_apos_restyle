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
  const { ddoc, view, ...rest } = params
  const params_ = { stale: false, ...rest }
  const auth = cFunctions.getAuth(BUCKET_NAME, PASSWORD)
  try {
    const queryString = cFunctions.objToQueryString(params_)
    const url = `http://${HOST}:8092/${BUCKET_NAME}/_design/${ddoc || BUCKET_NAME}/_view/${view}?${queryString}`
    log.debug('url view', url)
    const params = {
      headers: { Authorization: auth },
      url,
    }
    log.verbose('start exec service view')
    const { data: results } = await axios(params)
    log.verbose('end exec service view')
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
 * https://docs.couchbase.com/server/6.5/learn/views/views-querying.html
 * https://docs.couchbase.com/nodejs-sdk/current/howtos/view-queries-with-sdk.html
 * https://docs.couchbase.com/sdk-api/couchbase-node-client-3.0.6/Bucket.html#viewQuery
 */


async function exec (designDoc, viewName, bucket, options_ = {}) {
  const options = Object.assign({ scanConsistency: VIEW_SCAN_CONSISTENCY.RequestPlus, limit: 1 }, options_)
  try {
    log.verbose('start exec view')
    const results = await bucket.viewQuery(designDoc, viewName, options)
    log.verbose('end exec view')
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
