import log from '@adapter/common/src/winston'

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

export default {
  getDatabase,
  logFunc,
}
