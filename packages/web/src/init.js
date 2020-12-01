import { cFunctions, log } from '@adapter/common'

const isProd = cFunctions.isProd()
const REACT_APP = isProd ? 'REACT_APP' : 'REACT_APP_DEV'
const wlh = window.location.hostname
const ORIGIN = window.location.origin
const PROTOCOL = window.location.protocol || 'http:'
const BACKEND_PORT = PROTOCOL === 'http:' ? process.env[`${REACT_APP}_BACKEND_PORT`] : parseInt(process.env[`${REACT_APP}_BACKEND_PORT`],10) + 1000
const BACKEND_HOST = `${PROTOCOL}//${wlh}:${BACKEND_PORT}`
const HOSTNAME = process.env[`${REACT_APP}_COUCHBASE_FOR_LINK`] ? process.env[`${REACT_APP}_COUCHBASE_FOR_LINK`] : wlh

export const envConfig = {
  BACKEND_HOST,
  BACKEND_PORT,
  HOSTNAME,
  IS_PROD: isProd,
  LOG_LEVEL: process.env[`${REACT_APP}_LOG_LEVEL`] || 'INFO',
  ORIGIN,
  PROTOCOL,
}

log.setLevel(isProd ? log.levels[envConfig.LOG_LEVEL] : log.levels.TRACE) // Be sure to call setLevel method in order to apply plugin
log.table = isProd ? () => null : console.table // eslint-disable-line no-console
log.dir = isProd ? () => null : console.dir // eslint-disable-line no-console
log.table(envConfig)
