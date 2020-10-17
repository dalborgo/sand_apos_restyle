const express = require('express')
const path = require('path')
const router = express.Router()
const info = require(path.resolve('package.json'))
const config = require('config')
const { NAMESPACE } = config.get('express')
const { connections } = require(__helpers)

router.use(async function (req, res, next) {
  const { key } = req.query
  const connections_ = await connections.getDatabase(key)
  req.connections = connections_
  req.connObj = connections_.connObj
  next()
})

router.get('/', function (req, res) {
  res.locals.title = 'ADAPTER ASTENPOS SERVER'
  res.locals.nodejs = process.version
  res.locals.info = info
  res.locals.namespace = NAMESPACE
  res.render('index')
})

export default router
