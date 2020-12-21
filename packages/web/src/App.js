import React, { useMemo } from 'react'
import { Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { create } from 'jss'
import rtl from 'jss-rtl'
import { jssPreset, StylesProvider, ThemeProvider } from '@material-ui/core'
import MomentAdapter from '@material-ui/pickers/adapter/moment'
import GlobalStyles from 'src/components/GlobalStyles'
import ScrollReset from 'src/components/ScrollReset'
import { defaultQueryFn } from 'src/utils/reactQueryFunctions'
import { QueryClient, QueryClientProvider, useQueryErrorResetBoundary } from 'react-query'
import { IntlProvider } from 'react-intl'
import { ErrorBoundary } from 'react-error-boundary'
import { AuthProvider } from 'src/contexts/JWTAuthContext'
import useSettings from 'src/hooks/useSettings'
import { createTheme } from 'src/theme'
import routes, { renderRoutes } from 'src/routes'
import { ReactQueryDevtools } from 'react-query/devtools'
import { REACT_QUERY_DEV_TOOLS } from 'src/constants'
import SnackMyProvider from 'src/components/Snack/SnackComponents'
import Error500 from 'src/views/errors/Error500'
import log from '@adapter/common/src/log'
import useAuth from './hooks/useAuth'
import moment from 'moment'
import { LocalizationProvider } from '@material-ui/pickers'
import translations from 'src/translations'

const jss = create({ plugins: [...jssPreset().plugins, rtl()] })
const history = createBrowserHistory()

const myErrorHandler = (error, info) => {
  log.error('Global error', error)
  log.error('Global componentStack', info.componentStack)
}

const queryClient = new QueryClient({
  defaultOptions: {
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
  const { locale = 'it' } = settings //in futuro default lingua browser per homepage prima del login
  const { reset } = useQueryErrorResetBoundary()
  useMemo(() => {moment.locale(locale)}, [locale])  //altrimenti prende il secondo importato
  const theme = createTheme({
    direction: settings.direction,
    responsiveFontSizes: settings.responsiveFontSizes,
    theme: settings.theme,
  })
  return (
    <ThemeProvider theme={theme}>
      <StylesProvider jss={jss}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider> {/*prima del IntlProvider*/}
            <IntlProvider
              defaultLocale="it"
              key={locale}
              locale={locale}
              messages={translations[locale]}
            >
              <LocalizationProvider dateAdapter={MomentAdapter} locale={locale}>
                <GlobalStyles/>
                <ErrorBoundary FallbackComponent={Error500} onError={myErrorHandler} onReset={reset}>
                  <SnackMyProvider>
                    <Router history={history}>
                      <ScrollReset/>
                      <RouteList/>
                      {
                        REACT_QUERY_DEV_TOOLS &&
                        <ReactQueryDevtools initialIsOpen={Boolean(true)} panelProps={{ style: { height: 400 } }}/>
                      }
                    </Router>
                  </SnackMyProvider>
                </ErrorBoundary>
              </LocalizationProvider>
            </IntlProvider>
          </AuthProvider>
        </QueryClientProvider>
      </StylesProvider>
    </ThemeProvider>
  )
}

export default App
