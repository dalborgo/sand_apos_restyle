import config from 'config'
import couchbase from 'couchbase'
import log from '@adapter/common/src/winston'
import Couchbase from './class'

const { connections: connections_ } = require(__helpers)
const { connections, utility, CONFIG_TOTAL_TIMEOUT } = config.get('couchbase')

let dbSession

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
    const connStr = `couchbase://${connection.server}?config_total_timeout=${CONFIG_TOTAL_TIMEOUT}` //timeout for idea debug
    const astenpos_ = new couchbase.Cluster(connStr, optionsAstenpos)
    const archive_ = new couchbase.Cluster(connStr, optionsArchive)
    const astenpos = astenpos_.bucket(connection._bucket)
    const archive = archive_.bucket(connection._archivio)
    __buckets[key] = new Couchbase(astenpos_, astenpos, archive) //first parameter for cluster
    //region SESSION CONFIGURATION
    if (key === 'astenposServer') {
      const conn = __buckets[key]
      dbSession = conn.archiveBucketCollection
    } else {
      const options = { username: utility.user, password: utility.password, logFunc: connections_.logFunc }
      const cluster = new couchbase.Cluster(`couchbase://${utility.couchbase}`, options)
      const bucket = cluster.bucket(utility.session)
      dbSession = bucket.defaultCollection()
    }
    log.silly('Session initialized!')
    //endregion
  } catch (err) {
    log.error('CB connection error:', err)
    err.cause && log.error('code:', err.cause.code)
  }
})()

export {
  dbSession,
}
