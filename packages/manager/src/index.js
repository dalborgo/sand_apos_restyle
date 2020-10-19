const path = require('path')

//region GLOBAL PATH
global.__db = path.resolve('src/db')
global.__helpers = path.resolve('src/helpers')
global.__translations = path.resolve('src/translations/it-IT.json')
global.__buckets = {}
//endregion

require('./server')
