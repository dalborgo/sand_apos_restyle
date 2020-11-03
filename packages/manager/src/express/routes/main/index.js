import queries from './queries'
import docs from './docs'
import info from './info'
import jwt from './jwt'

const express = require('express')
const router = express.Router()
require('express-async-errors')

queries.addRouters(router)
docs.addRouters(router)
info.addRouters(router)
jwt.addRouters(router)

router.get('/', function (req, res) {
  res.redirect('/')
})

export default router


