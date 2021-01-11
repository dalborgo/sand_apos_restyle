import config from 'config'
import couchbase from 'couchbase'
import log from '@adapter/common/src/winston'
import Couchbase from './class'
import { cFunctions } from '@adapter/common'

const { connections: connections_ } = require(__helpers)
const { connections, CONFIG_TOTAL_TIMEOUT } = config.get('couchbase')

let connInstance

void (async () => {
  try {
    let [key] = Object.keys(connections)
    const connection = connections[key]
    const optionsAstenpos = {
      username: connection._bucket,
      password: connection._password_bucket || connection._bucket,
      logFunc: connections_.logFunc,
    }
    const queryString = cFunctions.objToQueryString({ config_total_timeout: CONFIG_TOTAL_TIMEOUT }, true)
    const connStr = `couchbase://${connection.server}${queryString}`
    log.debug('connStr', connStr)
    const astenpos_ = new couchbase.Cluster(connStr, optionsAstenpos)
    const astenpos = astenpos_.bucket(connection._bucket)
    __buckets[key] = new Couchbase(astenpos_, astenpos) //first parameter for cluster
    const conn = __buckets[key]
    connInstance = conn.archiveBucketCollection
  } catch (err) {
    log.error('CB connection error:', err)
    err.cause && log.error('code:', err.cause.code)
  }
})()

export {
  connInstance,
}
