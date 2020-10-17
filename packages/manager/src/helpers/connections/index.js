import couchbase from 'couchbase'
import log from '@adapter/common/src/winston'
import axios from 'axios'
import config from 'config'

const Couchbase = require(`${__db}/class`)
const DEBUG = process.env.DEBUG
const fullLog = DEBUG === 'couchnode*'
const logFunc = !fullLog ? log_ => (log_.subsys === 'cccp' && log_.severity > 3) && log.warn('warn', JSON.stringify(log_, ['severity', 'message'], 2)) : undefined
const { utility } = config.get('couchbase')

async function getDatabase (key) {
  try {
    if (__BUCKETS[key]) {return __BUCKETS[key]}
    if (!key) {return __BUCKETS['astenposServer'] ? __BUCKETS['astenposServer'] : null}
    const { data = {} } = await axios.get(`http://${utility.manager}:4000/cloud/request_credential`, { params: { key } })
    const { ok, results, message } = data
    if (!ok) { return log.error(message)}
    const optionsAstenpos = {
      username: results.couchbaseBucket,
      password: results.key,
      logFunc,
    }
    const optionsArchive = {
      username: results.key,
      password: results.key,
      logFunc,
    }
    const astenpos_ = new couchbase.Cluster(`couchbase://${results.couchbaseUrl}`, optionsAstenpos)
    const archive_ = new couchbase.Cluster(`couchbase://${results.couchbaseUrl}`, optionsArchive)
    const astenpos = astenpos_.bucket(results.key)
    const archive = archive_.bucket(results.key)
    __BUCKETS[key] = new Couchbase(astenpos, archive, results.backendUrl)
    return __BUCKETS[key]
  } catch (err) {
    log.error(err)
  }
}

export default {
  getDatabase,
  logFunc,
}
