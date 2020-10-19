import template from 'lodash/template'

function format (text, options = {}) {
  const compiled = template(text)
  return compiled(options)
}

export default {
  format,
}
