const { BadRequest } = require(__errors)
import { security } from '../'

/**
 *
 * bucketLabel = identificativo per la query condition se richiede di un essere ambigua (es. JOIN)
 */
function parseOwner ({ query, body, headers }, bucketLabel) {
  const { owner } = Object.assign({}, body, query)
  if (!owner) {return {}}
  const ownerArray = Array.isArray(owner) ? owner : [owner]
  security.hasAuthorization(headers, ownerArray)
  const [startOwner] = ownerArray
  const endOwner = ownerArray.length > 1 ? ownerArray[ownerArray.length - 1] : startOwner
  return {
    endOwner,
    ownerArray,
    queryCondition: `${bucketLabel ? `${bucketLabel}.` : ''}owner IN ${JSON.stringify(ownerArray)}`,
    startOwner,
  }
}

const checkSide = allIn => Boolean(allIn === 'true' || allIn === true)

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
    throw new BadRequest('MISSING_PARAMETERS', { parameters: errors })
  }
}

export default {
  checkSide,
  controlParameters,
  parseOwner,
}
