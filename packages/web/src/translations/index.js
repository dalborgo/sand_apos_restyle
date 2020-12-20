import messagesIT from './it.json'
import messagesDE from './de.json'
import messagesGB from './en-gb.json'

require('moment/locale/de')
require('moment/locale/en-gb')
require('moment/locale/it')

export default {
  it: messagesIT,
  de: messagesDE,
  'en-gb': messagesGB,
}
