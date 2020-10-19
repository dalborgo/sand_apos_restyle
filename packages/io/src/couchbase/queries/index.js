import log from '@adapter/common/src/winston'
import couchbase from 'couchbase'

const CONSISTENCY = {
  RequestPlus: couchbase.QueryScanConsistency.RequestPlus,
}

/**
 * @param options: es. { parameters: { TYPE: 'USER' } } or ARRAY
 */
async function exec (query, cluster, options_ = {}) {
  const options = Object.assign({
    scanConsistency: CONSISTENCY.RequestPlus,
  }, options_)
  try {
    log.debug('query', query)
    const { meta, rows } = await cluster.query(query, options)
    log.debug('executionTime', `${meta.metrics.executionTime} ms`)
    return { ok: true, results: rows }
  } catch (err) {
    log.error(err)
    return { ok: false, err, message: err.message }
  }
}

export default {
  exec,
}
