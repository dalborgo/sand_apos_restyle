const path = require('path')

//region GLOBAL PATH
global.__db = path.resolve('src/db')
global.__helpers = path.resolve('src/helpers')
global.__errors = path.resolve('src/express/errors')
global.__buckets = {}
//endregion

require('./server')
