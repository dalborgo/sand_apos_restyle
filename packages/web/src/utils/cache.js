/*function checkQuery (firstKey) {
  return ['docs/get_by_id'].includes(firstKey)
}*/

function queryCache (queryCache) {
  const wlp = window.location.pathname
  !wlp.startsWith('/app/reports/browser') && queryCache.removeQueries('docs/browser')
  //queryCache.removeQueries('docs/get_by_id')
  /*queryCache.removeQueries(query => {
    const [firstKey] = query?.queryKey
    let toRemove = true
    toRemove &= checkQuery(firstKey)
    return toRemove
  })*/
}

export default queryCache
