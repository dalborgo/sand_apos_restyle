const { BadRequest } = require(__errors)
import { security } from '../'

/**
 *
 * @param req: {owner, headers}
 * @param bucketLabel = identificativo per la query condition se richiede di un essere ambigua (es. JOIN)
 */
function parseOwner ({ query, body, headers }, bucketLabel) {
  const {owner} = Object.assign({}, body, query)
  const ownerArray = Array.isArray(owner) ? owner : [owner]
  security.hasAuthorization(headers, ownerArray)
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
    queryCondition: `${bucketLabel ? `${bucketLabel}.` : ''}owner IN ${JSON.stringify(ownerArray)}`,
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
