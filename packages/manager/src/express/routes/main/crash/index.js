import rateLimit from 'express-rate-limit'
import { reqAuthPost } from '../../basicAuth'
const apiLimiter = rateLimit({
  skip: ({ body }) => {
    const { CUSTOM_DATA: customData } = body
    const { REQUEST_SUPPORT: requestSupport } = customData || {}
    return Boolean(requestSupport)
  },
})

function addRouters (router) {
  router.post('/crash/send', apiLimiter, reqAuthPost, async function (req, res) {
    const { connClass, body } = req
    const { astenposBucketCollection: collection } = connClass
    const {
      STACK_TRACE: stackTrace,
      LOGCAT: logCat,
      REPORT_ID: reportId,
      CUSTOM_DATA: customData,
    } = body
    const { owner = 'XXXXXX' } = customData || {}
    let results
    if (stackTrace || logCat) {
      let expressiveLog
      if (stackTrace.includes('asten.epele.com.afame')) {
        const [expressiveLog_] = stackTrace.match(/(asten.epele.com.afame.[a-zA-Z0-9.(:)]*\))/)
        expressiveLog = expressiveLog_
      }
      results = await collection.upsert(`CRASH_${reportId}`, { ...body, type: 'CRASH', owner, expressiveLog })
    }
    res.send({ ok: true, results })
  })
}

export default {
  addRouters,
}
