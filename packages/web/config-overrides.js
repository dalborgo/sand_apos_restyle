const { NODE_ENV } = process.env
if (NODE_ENV !== 'production') {
  const { addBabelPlugin, override } = require('customize-cra')
  //const { addReactRefresh } = require('customize-cra-react-refresh')
  module.exports = override(
    //addReactRefresh(),
    addBabelPlugin(['react-intl', { enforceDescriptions: false }]),
    addBabelPlugin(['react-intl-extractor', {
      extractedFile: './src/translations/all.json',
      langFiles: [{ path: './src/translations/en-US.json', cleanUpNewMessages: true }, {
        path: './src/translations/it-IT.json',
        cleanUpNewMessages: false,
      }],
    },
    ])
  )
}
