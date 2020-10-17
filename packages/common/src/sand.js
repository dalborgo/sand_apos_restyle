import validation from './validation'
import date from './date'

const deb = require('debug')('com:base')

deb(validation.valEmail('marco@dalborgo.it'))
deb(validation.valDate('10-11-1981'))
console.log(date.now())
