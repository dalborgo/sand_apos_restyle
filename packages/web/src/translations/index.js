import messagesDE from './de.json'
import messagesGB from './en-gb.json'
import messagesIT from './it.json'

require('moment/locale/de')
require('moment/locale/en-gb')
require('moment/locale/it')

const maskMap = {
  de: '__.__.____',
  it: '__/__/____',
}
export const getMaskMap = locale => maskMap[locale] || maskMap['it']
export const to2Chars = (val = '') => val.split('-')[1] || val
const translations = {
  'en-gb': messagesGB,
  de: messagesDE,
  it: messagesIT,
}
export default translations

