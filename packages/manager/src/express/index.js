import { cDate, cFunctions, numeric } from '@adapter/common'
import log from '@adapter/common/src/winston'
import indexRouter from './routes'
import appRouter from './routes/main'
import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cors from 'cors'
import favicon from 'serve-favicon'
import config from 'config'
import get from 'lodash/get'

const { connInstance } = require(__db)
const morgan = require('morgan')
const { NAMESPACE, BODY_LIMIT = '100kb', MAXAGE_MINUTES = 30 } = config.get('express')
const SESSION_ENABLED = false
const app = express()
app.disable('x-powered-by')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

morgan.token('data', function () {
  return cDate.now('DD/MM/YY HH:mm:ss')
})
morgan.token('remote-ip', function (req) {
  return req.ip.replace('::ffff:', '')
})
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(cors())
app.use(morgan(
  function (tokens, req, res) {
    return [
      '<-',
      tokens.data(req, res),
      tokens['remote-ip'](req, res),
      tokens.method(req, res),
      tokens.url(req, res),
      numeric.printByte(tokens.req(req, res, 'content-length')), '/',
      numeric.printByte(tokens.res(req, res, 'content-length')),
      tokens.status(req, res),
      tokens['response-time'](req, res, 0), 'ms',
    ].join(' ')
  }, {
    skip: function (req) {
      const regex = /^\/?[\w/?.&-=]+\/?((\bimages\b)|(\bimg\b)|(\bfavicon.ico\b)|(\bfavicon\b)|(\bcss\b)|(\bjs\b))\/[\w/?.%&-=]+$/
      if (regex.test(req.url)) {
        return true
      }
    },
  })
)
app.use(express.json({ limit: BODY_LIMIT }))
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

if (SESSION_ENABLED) {
  log.silly('Session started')
  const session = require('express-session')
  const CouchbaseStore = require('connect-couchbase')(session)
  const couchbaseStore = new CouchbaseStore({ db: connInstance, prefix: 'sess::' })
  app.use(session({
    cookie: {
      maxAge: MAXAGE_MINUTES * 60 * 1000,
      sameSite: true,
      secure: false, //true if https server
    },
    name: 'astenposSession',
    resave: true,
    rolling: true,
    saveUninitialized: false,
    secret: 'boobs',
    store: couchbaseStore,
  }))
}

app.use('/', indexRouter)
app.use(`/${NAMESPACE}`, appRouter)

function getInterceptedResponse (message, cause) {
  const restartResponse = { interceptedResponseStatus: 503, hasToRestartServer: true }
  if (cause === 201) {
    return restartResponse
  }
  switch (message) {
    case 'cluster object was closed':
    case 'parent cluster object has been closed':
      return restartResponse
    default:
      return {}
  }
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  log.error(err)
  let responseAxiosError
  if (err.isAxiosError) {
    log.error('Is an axios error!')
    if (err.response) {
      log.error('Response data', err.response.data)
      responseAxiosError = {
        data: err.response.data,
        status: err.response.status,
        headers: err.response.headers,
      }
    }
  }
  const { interceptedResponseStatus, hasToRestartServer } = getInterceptedResponse(err.message, err.cause)
  if (hasToRestartServer && cFunctions.isProd()) {
    setTimeout(() => {
      log.warn('RESTART SERVER DUE CONNECTION PROBLEM!')
      process.exit(1)
    }, 1000)
  }
  res.status(interceptedResponseStatus || err.status || 500)
  const couchErrorCode = get(err, 'cause.code')
  res.send({
    cause: couchErrorCode || err.code,
    err,
    message: err.message,
    ok: false,
    responseAxiosError,
  })
})

app.use(function (req, res) {
  const err = createError(404)
  log.warn(`${err.message} ${req.originalUrl}`)
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500)
  res.render('error')
})

export default app
