import { cFunctions } from '@adapter/common'
import axios from 'axios'
import log from '@adapter/common/src/winston'

async function execViewService (params, connection = {}) {
  const { HOST, PASSWORD, BUCKET_NAME } = connection
  const { ddoc, view, stale = false, descending = false, startkey, endkey } = params
  const auth = cFunctions.getAuth(BUCKET_NAME, PASSWORD)
  try {
    const start = startkey ? `&startkey=${startkey}` : ''
    const end = endkey ? `&endkey=${endkey}` : ''
    const params = {
      headers: { Authorization: auth },
      url: `http://${HOST}:8092/${BUCKET_NAME}/_design/${ddoc || BUCKET_NAME}/_view/${view}?stale=${stale}&descending=${descending}${start}${end}`,
    }
    const { data: { rows } } = await axios(params)
    return { ok: true, results: rows }
  } catch (err) {
    log.error(err)
    return { ok: false, err, message: err.message }
  }
}

export default {
  execViewService,
}
