const express = require('express')
const path = require('path')
const router = express.Router()
const info = require(path.resolve('package.json'))
const config = require('config')
const { NAMESPACE } = config.get('express')
const { connections } = require(__helpers)
require('express-async-errors')
router.use(async function (req, res, next) {
  const { _key } = req.query
  const connections_ = await connections.getDatabase(_key)
  req.connClass = connections_
  req.connJSON = connections_.connJSON
  next()
})

router.get('/', function (req, res) {
  res.locals.title = 'ADAPTER ASTENPOS SERVER'
  res.locals.nodejs = process.version
  res.locals.info = info
  res.locals.namespace = NAMESPACE
  res.locals.environment = process.env.NODE_ENV || 'development'
  res.render('index')
})

export default router
