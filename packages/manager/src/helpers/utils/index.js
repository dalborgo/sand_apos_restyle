import { BadRequest } from '../../express/errors'

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
    ownerArray,
    queryCondition: `owner IN ${JSON.stringify(ownerArray)}`,
    startOwner,
  }
}

function controlParameters (query, requiredKeys) {
  const out = []
  let errors
  for (let requiredKey of requiredKeys) {
    if (!query[requiredKey]) {
      out.push(requiredKey)
    }
  }
  if (out.length) {
    errors = out.join(', ')
    throw new BadRequest('MISSINGPARAMETERS', { parameters: errors })
  }
}

export default {
  controlParameters,
  parseOwner,
}
