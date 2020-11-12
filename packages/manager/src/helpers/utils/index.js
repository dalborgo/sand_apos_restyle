function parseOwner ({ owner }) {
  const ownerArray = Array.isArray(owner) ? owner : [owner]
  const [startOwner] = ownerArray
  const endOwner = ownerArray.length > 1 ? ownerArray[ownerArray.length - 1] : startOwner
  const nextOwner = endOwner
    ? endOwner.substring(0, endOwner.length - 1) + String.fromCharCode(endOwner.charCodeAt(endOwner.length - 1) + 1)
    : startOwner
  return {
    endOwner,
    limitsInView: {
      startkey: `"${startOwner}"`,
      endkey: `"${nextOwner}"`,
    },
    queryCondition: `owner IN ${JSON.stringify(ownerArray)}`,
    startOwner,
  }
}

export default {
  parseOwner,
}
