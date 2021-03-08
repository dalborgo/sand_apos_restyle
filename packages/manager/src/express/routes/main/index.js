import queries from './queries'
import crash from './crash'
import docs from './docs'
import eInvoices from './e-invoices'
import hotel from './hotel'
import info from './info'
import installations from './installations'
import jwt from './jwt'
import management from './management'
import routines from './routines'
import reports from './reports'
import stats from './stats'
import utils from './utils'
import types from './types'

const express = require('express')
const router = express.Router()
require('express-async-errors')

queries.addRouters(router)
crash.addRouters(router)
docs.addRouters(router)
eInvoices.addRouters(router)
hotel.addRouters(router)
info.addRouters(router)
installations.addRouters(router)
jwt.addRouters(router)
management.addRouters(router)
reports.addRouters(router)
routines.addRouters(router)
stats.addRouters(router)
utils.addRouters(router)
types.addRouters(router)

router.get('/', function (req, res) {
  res.redirect('/')
})

export default router


