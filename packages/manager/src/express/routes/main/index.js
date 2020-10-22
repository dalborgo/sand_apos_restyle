import { reqAuthGet, reqAuthPost } from '../auth'
import docs from './docs'
import info from './info'
import secure from './secure'

const express = require('express')
const router = express.Router()
require('express-async-errors')

docs.addRouters(router)
info.addRouters(router)
secure.addRouters(router)

router.get('/', function (req, res) {
  res.redirect('/')
})

router.get('/reserved', reqAuthGet, function (req, res) {
  res.send('reserved')
})

router.get('/reserved', reqAuthPost, function (req, res) {
  res.send('reserved')
})

export default router


