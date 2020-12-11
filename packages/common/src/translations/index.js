import LocaleCurrency from 'locale-currency'
import getSymbolFromCurrency from 'currency-symbol-map'
import compose from 'lodash/fp/compose'
import template from 'lodash/template'
function format (text, options = {}) {
  const compiled = template(text)
  return compiled(options)
}
const getLocaleCurrency = locale => LocaleCurrency.getCurrency(locale)
const getSymbolFromLocale = locale => compose(getSymbolFromCurrency, getLocaleCurrency)(locale)
export default {
  format,
  getLocaleCurrency,
  getSymbolFromLocale,
}
