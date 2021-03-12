import Q from 'q'

const { BadRequest } = require(__errors)
import { security } from '../'

/**
 *
 * bucketLabel = identificativo per la query condition se richiede di un essere ambigua (es. JOIN)
 */
function parseOwner ({ query, body, headers }, bucketLabel) {
  const { owner } = Object.assign({}, body, query)
  const ownerArray = Array.isArray(owner) ? owner : [owner]
  security.hasAuthorization(headers, ownerArray)
  if (!owner) {return {}}
  const [startOwner] = ownerArray
  const endOwner = ownerArray.length > 1 ? ownerArray[ownerArray.length - 1] : startOwner
  return {
    endOwner,
    ownerArray,
    queryCondition: `${bucketLabel ? `${bucketLabel}.` : ''}owner IN ${JSON.stringify(ownerArray)}`,
    startOwner,
  }
}
function checkSecurity({ query, body, headers }) {
  const { owner } = Object.assign({}, body, query)
  const ownerArray = Array.isArray(owner) ? owner : [owner]
  security.hasAuthorization(headers, ownerArray)
}

const checkSide = allIn => Boolean(allIn === 'true' || allIn === true)

function checkParameters (query, requiredKeys) {
  const out = []
  let errors
  for (let requiredKey of requiredKeys) {
    if (!query[requiredKey]) {
      out.push(requiredKey)
    }
  }
  if (out.length) {
    errors = out.join(', ')
    throw new BadRequest('MISSING_PARAMETERS', { parameters: errors }, `Bad request. Missing parameters: ${errors}`)
  }
}

async function allSettled (promises) {
  const output = []
  const results = await Q.allSettled(promises)
  results.forEach(result => {
    const { state, value } = result
    if (state === 'fulfilled') {
      output.push(value)
    } else {
      output.push(null)
    }
  })
  return output
}

export default {
  allSettled,
  checkSecurity,
  checkSide,
  checkParameters,
  parseOwner,
}
