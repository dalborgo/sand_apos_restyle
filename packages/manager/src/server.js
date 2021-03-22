#!/usr/bin/env node
import log from '@adapter/common/src/winston'
import app from './express'
import config from 'config'
import http from 'http'
import https from 'https'
import fs from 'fs'
import path from 'path'
import { cFunctions } from '@adapter/common'

const { PORT } = config.get('express')
const { connections } = config.get('couchbase')
const { _certpath: CERT_PATH } = connections['astenposServer']

function normalizePort (val) {
  const port = parseInt(val, 10)
  if (isNaN(port)) {
    return val
  }
  if (port >= 0) {
    return port
  }
  return false
}

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }
  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port
  switch (error.code) {
    case 'EACCES':
      log.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      log.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

const port = normalizePort(PORT)
const httpsPort = port + 50
const server = http.createServer(app)
server.listen(port)
server.on('error', onError)
server.on('listening', onListeningHttp)

if(cFunctions.isProd()){
  const certLabel = CERT_PATH === 'prod-CA.pem' ? '_prod' : ''
  const keyPath = path.join(__dirname, `../../../../cert/key${certLabel}.key`)
  const certPath = path.join(__dirname, `../../../../cert/certificate${certLabel}.pem`)
  
  const httpsConfig = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  }
  const serverHttps = https.createServer(httpsConfig, app)
  serverHttps.listen(httpsPort)
  serverHttps.on('error', onError)
  serverHttps.on('listening', onListeningHttps)
}

async function onListeningHttp () {
  log.info(`Http Backend listening on port ${port}`)
}

async function onListeningHttps () {
  log.info(`Https Backend listening on port ${httpsPort}`)
}





