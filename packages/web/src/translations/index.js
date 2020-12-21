import messagesDE from './de.json'
import messagesGB from './en-gb.json'
import messagesIT from './it.json'

require('moment/locale/de')
require('moment/locale/en-gb')
require('moment/locale/it')


export const maskMap = {
  de: '__.__.____',
  en: '__/__/____',
  it: '__/__/____',
}

export default {
  'en-gb': messagesGB,
  de: messagesDE,
  it: messagesIT,
}

