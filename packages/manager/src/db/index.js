import config from 'config'
import couchbase from 'couchbase'
import log from '@adapter/common/src/winston'
import Couchbase from './class'

const { connections: connections_ } = require(__helpers)
const { connections, utility } = config.get('couchbase')

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
    const astenpos_ = new couchbase.Cluster(`couchbase://${connection.server}`, optionsAstenpos)
    const archive_ = new couchbase.Cluster(`couchbase://${connection.server}`, optionsArchive)
    const astenpos = astenpos_.bucket(connection._bucket)
    const archive = archive_.bucket(connection._archivio)
    __BUCKETS[key] = new Couchbase(astenpos, archive)
    //region SESSION CONFIGURATION
    if (key === 'astenposServer') {
      const conn = __BUCKETS[key]
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
