import queries from './queries'
import docs from './docs'
import hotel from './hotel'
import info from './info'
import installations from './installations'
import jwt from './jwt'
import routines from './routines'
import reports from './reports'
import stats from './stats'
import types from './types'

const express = require('express')
const router = express.Router()
require('express-async-errors')

queries.addRouters(router)
docs.addRouters(router)
hotel.addRouters(router)
info.addRouters(router)
installations.addRouters(router)
jwt.addRouters(router)
reports.addRouters(router)
routines.addRouters(router)
stats.addRouters(router)
types.addRouters(router)

router.get('/', function (req, res) {
  res.redirect('/')
})

export default router


