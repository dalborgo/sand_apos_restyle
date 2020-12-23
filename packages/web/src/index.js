import 'react-perfect-scrollbar/dist/css/styles.css'
import 'src/__mocks__'
import 'src/mixins/chartjs'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import 'src/utils/wdyr'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from 'src/store'
import { SettingsProvider } from 'src/contexts/SettingsContext'
import App from 'src/App'
import './init'


ReactDOM.render(
  <Provider store={store}>
    <SettingsProvider>
      <App/>
    </SettingsProvider>
  </Provider>,
  document.getElementById('root')
)

/*
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <SettingsProvider>
        <App/>
      </SettingsProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
*/
