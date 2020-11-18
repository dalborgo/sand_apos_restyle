import React, { useMemo } from 'react'
import { Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { create } from 'jss'
import rtl from 'jss-rtl'
import MomentUtils from '@date-io/moment'
import { jssPreset, StylesProvider, ThemeProvider } from '@material-ui/core'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import GlobalStyles from 'src/components/GlobalStyles'
import ScrollReset from 'src/components/ScrollReset'
import { defaultQueryFn } from 'src/utils/reactQueryFunctions'
import { QueryCache, ReactQueryCacheProvider, useErrorResetBoundary } from 'react-query'
import { IntlProvider } from 'react-intl'
import { ErrorBoundary } from 'react-error-boundary'
import messages from 'src/translations/it-IT.json'
import { AuthProvider } from 'src/contexts/JWTAuthContext'
import useSettings from 'src/hooks/useSettings'
import { createTheme } from 'src/theme'
import routes, { renderRoutes } from 'src/routes'
import { ReactQueryDevtools } from 'react-query-devtools'
import { REACT_QUERY_DEV_TOOLS } from 'src/constants'
import SnackMyProvider from 'src/components/Snack/SnackComponents'
import Error500 from 'src/views/errors/Error500'
import log from '@adapter/common/src/log'
import useAuth from './hooks/useAuth'
import { RecoilRoot } from 'recoil'

const jss = create({ plugins: [...jssPreset().plugins, rtl()] })
const history = createBrowserHistory()

const myErrorHandler = (error, info) => {
  log.error('Global error', error)
  log.error('Global componentStack', info.componentStack)
}

const queryCache = new QueryCache({
  defaultConfig: {
    queries: {
      queryFn: defaultQueryFn,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

const RouteList = () => {
  const { user } = useAuth()
  return useMemo(() => {
    return renderRoutes(routes, user?.priority)
  }, [user])
}

const App = () => {
  const { settings } = useSettings()
  const { reset } = useErrorResetBoundary()
  const theme = createTheme({
    direction: settings.direction,
    responsiveFontSizes: settings.responsiveFontSizes,
    theme: settings.theme,
  })
  return (
    <ThemeProvider theme={theme}>
      <StylesProvider jss={jss}>
        <IntlProvider defaultLocale="it" locale="it" messages={messages}>
          <GlobalStyles/>
          <ErrorBoundary FallbackComponent={Error500} onError={myErrorHandler} onReset={reset}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <SnackMyProvider>
                <Router history={history}>
                  <ReactQueryCacheProvider queryCache={queryCache}>
                    <RecoilRoot>
                      <AuthProvider>
                        <ScrollReset/>
                        <RouteList/>
                        {
                          REACT_QUERY_DEV_TOOLS &&
                          <ReactQueryDevtools initialIsOpen/>
                        }
                      </AuthProvider>
                    </RecoilRoot>
                  </ReactQueryCacheProvider>
                </Router>
              </SnackMyProvider>
            </MuiPickersUtilsProvider>
          </ErrorBoundary>
        </IntlProvider>
      </StylesProvider>
    </ThemeProvider>
  )
}

export default App
