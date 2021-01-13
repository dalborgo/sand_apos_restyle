import log from '@adapter/common/src/winston'
import config from 'config'
const { PORT } = config.get('express')
const DEBUG = process.env.DEBUG
const fullLog = DEBUG !== 'couchnode'
const logFunc = !fullLog ? log_ => (log_.subsys === 'cccp' && log_.severity > 3) && log.warn('warn', JSON.stringify(log_, ['severity', 'message'], 2)) : undefined

async function getDatabase () {
  try {
    return __buckets['astenposServer'] ? __buckets['astenposServer'] : {}
  } catch (err) {
    log.error(err)
    return {}
  }
}
const isInternal = headers => {
  const { host } = headers
  return host === `localhost:${PORT}` || host === `127.0.0.1:${PORT}`
}

export default {
  getDatabase,
  isInternal,
  logFunc,
}
