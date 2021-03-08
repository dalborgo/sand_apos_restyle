function addRouters (router) {
  // /(asten.epele.com.afame.[a-zA-Z0-9.(:)]*\))/
  router.post('/crash/send', async function (req, res) {
    const { connClass, body } = req
    const { astenposBucketCollection: collection } = connClass
    const {
      STACK_TRACE: stackTrace,
      LOGCAT: logCat,
      REPORT_ID: reportId,
      CUSTOM_DATA: customData,
    } = body
    const { owner = 'XXXXXX', REQUEST_SUPPORT: requestSupport } = customData || {}
    let results
    if (stackTrace && logCat) {
      results = await collection.upsert(`CRASH|${reportId}`, { ...body, type: 'CRASH', owner })
    }
    res.send({ ok: true, results })
  })
}

export default {
  addRouters,
}
