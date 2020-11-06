import couchbase from 'couchbase'
import log from '@adapter/common/src/winston'
import axios from 'axios'
import config from 'config'
import { cFunctions } from '@adapter/common'

const Couchbase = require(`${__db}/class`)
const DEBUG = process.env.DEBUG
const fullLog = DEBUG === 'couchnode*'
const logFunc = !fullLog ? log_ => (log_.subsys === 'cccp' && log_.severity > 3) && log.warn('warn', JSON.stringify(log_, ['severity', 'message'], 2)) : undefined
const { utility, CONFIG_TOTAL_TIMEOUT } = config.get('couchbase')

async function getDatabase (key) {
  try {
    !key && log.silly('Query param "_key" not defined!')
    if (__buckets[key]) {return __buckets[key]}
    if (!key) {return __buckets['astenposServer'] ? __buckets['astenposServer'] : {}}
    log.debug('Astenpos Express key', key)
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
    const queryString = cFunctions.objToQueryString({ config_total_timeout: CONFIG_TOTAL_TIMEOUT }, true)
    const connStr = `couchbase://${results.couchbaseUrl}${queryString}`
    log.debug('connStr', connStr)
    const astenpos_ = new couchbase.Cluster(connStr, optionsAstenpos)
    const archive_ = new couchbase.Cluster(connStr, optionsArchive)
    const astenpos = astenpos_.bucket(results.key)
    const archive = archive_.bucket(results.key)
    __buckets[key] = new Couchbase(astenpos_, astenpos, archive, results.backendUrl) //first parameter for cluster
    return __buckets[key]
  } catch (err) {
    log.error(err)
    return {}
  }
}

export default {
  getDatabase,
  logFunc,
}
