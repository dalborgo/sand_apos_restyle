import couchbase from 'couchbase'
import log from '@adapter/common/src/winston'
import config from 'config'

const { connections: connections_ } = require(__helpers)
const { connections, utility } = config.get('couchbase')
let dbSession
(async () => {
  try {
    let [key] = Object.keys(connections)
    if (key === 'astenposServer') {
      const conn = __BUCKETS[key]
      console.log('conn:', conn)
      dbSession = conn.archiveBucketCollection
    } else {
      const options = { username: utility.user, password: utility.password, logFunc: connections_.logFunc }
      const cluster = new couchbase.Cluster(`couchbase://${utility.couchbase}`, options)
      const bucket = cluster.bucket(utility.session)
      dbSession = bucket.defaultCollection()
    }
    log.silly('session initialized!')
  } catch (err) {
    log.error('CB connection error:', err)
    err.cause && log.error('code:', err.cause.code)
  }
})()

export {
  dbSession,
}
