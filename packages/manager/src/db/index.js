import config from 'config'
import couchbase from 'couchbase'
import log from '@adapter/common/src/winston'
import Couchbase from './class'
import { cFunctions } from '@adapter/common'

const { connections: connections_ } = require(__helpers)
const { connections, utility, CONFIG_TOTAL_TIMEOUT } = config.get('couchbase')

let connInstance

void (async () => {
  try {
    let [key] = Object.keys(connections)
    const connection = connections[key]
    const optionsAstenpos = {
      username: connection._bucket,
      password: connection._password_bucket,
      logFunc: connections_.logFunc,
    }
    const optionsArchive = {
      username: connection._archivio,
      password: connection._password_archivio,
      logFunc: connections_.logFunc,
    }
    const queryString = cFunctions.objToQueryString({ config_total_timeout: CONFIG_TOTAL_TIMEOUT }, true)
    const connStr = `couchbase://${connection.server}${queryString}` //timeout for idea debug
    log.debug('connStr', connStr)
    const astenpos_ = new couchbase.Cluster(connStr, optionsAstenpos)
    const archive_ = new couchbase.Cluster(connStr, optionsArchive)
    const astenpos = astenpos_.bucket(connection._bucket)
    const archive = archive_.bucket(connection._archivio)
    __buckets[key] = new Couchbase(astenpos_, astenpos, archive) //first parameter for cluster
    //region CONNECTION INSTANCE CONFIGURATION
    if (key === 'astenposServer') {
      const conn = __buckets[key]
      connInstance = conn.archiveBucketCollection
    } else {
      const options = { username: utility.user, password: utility.password, logFunc: connections_.logFunc }
      const cluster = new couchbase.Cluster(`couchbase://${utility.couchbase}`, options)
      const bucket = cluster.bucket(utility.session)
      connInstance = bucket.defaultCollection()
    }
    //endregion
  } catch (err) {
    log.error('CB connection error:', err)
    err.cause && log.error('code:', err.cause.code)
  }
})()

export {
  connInstance,
}
