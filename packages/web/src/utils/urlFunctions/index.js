import { matchPath } from 'react-router'

export function testParams (path) {
  const currentLocation = window.location
  const match = matchPath(currentLocation.pathname, { path, exact: true, strict: false })
  if (match?.params) {
    const outParams = {}
    for (let key in match.params) {
      outParams[key] = decodeURIComponent(match.params[key])
    }
    return outParams
  }
}

export const parentPath = path => path.split('/').slice(0, -1).join('/')
