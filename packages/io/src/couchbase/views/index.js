import { cFunctions } from '@adapter/common'
import axios from 'axios'
import log from '@adapter/common/src/winston'

async function execViewService (params, connection = {}) {
  const { HOST, PASSWORD, BUCKET_NAME } = connection
  const { ddoc, view, ...rest } = params
  const params_ = { stale: false, ...rest }
  const auth = cFunctions.getAuth(BUCKET_NAME, PASSWORD)
  try {
    const queryString = cFunctions.objToQueryString(params_)
    log.verbose('start view')
    const url = `http://${HOST}:8092/${BUCKET_NAME}/_design/${ddoc || BUCKET_NAME}/_view/${view}?${queryString}`
    log.debug('url view', url)
    const params = {
      headers: { Authorization: auth },
      url,
    }
    const { data: results } = await axios(params)
    log.verbose('end view')
    return { ok: true, results }
  } catch (err) {
    log.error(err)
    return { ok: false, err, message: err.message }
  }
}

export default {
  execViewService,
}
