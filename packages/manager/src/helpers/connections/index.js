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

const isInternal = headers => {
  log.debug('headers:', headers)
  const { origin, internalcall } = headers
  const checked = !origin && internalcall
  if (checked) {log.silly('internal call')}
  return checked
}

export default {
  getDatabase,
  isInternal,
  logFunc,
}
