import React, { useMemo } from 'react'
import { Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { create } from 'jss'
import rtl from 'jss-rtl'
import { jssPreset, StylesProvider, ThemeProvider, Typography } from '@material-ui/core'
import MomentAdapter from '@material-ui/pickers/adapter/moment'
import GlobalStyles from 'src/components/GlobalStyles'
import ScrollReset from 'src/components/ScrollReset'
import { defaultQueryFn } from 'src/utils/reactQueryFunctions'
import { QueryClient, QueryClientProvider, useQueryErrorResetBoundary } from 'react-query'
import { IntlProvider, useIntl } from 'react-intl'
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
import { ConfirmProvider } from 'material-ui-confirm'
import useAuth from './hooks/useAuth'
import moment from 'moment'
import { LocalizationProvider } from '@material-ui/pickers'
import translations from 'src/translations'
import { messages } from './translations/messages'

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
  const { user, selectedCode } = useAuth()
  return useMemo(() => {
    return renderRoutes(routes, user?.priority, selectedCode.code)
  }, [selectedCode.code, user.priority])
}

const ConfirmIntlProvider = ({ children }) => {
  const intl = useIntl()
  return (
    <ConfirmProvider
      defaultOptions={
        {
          cancellationText: intl.formatMessage(messages['common_cancel']),
          confirmationText: intl.formatMessage(messages['common_confirm']),
          title: 
            <Typography component="span" variant="h5">
              {
                intl.formatMessage(messages['common_confirm_operation'])
              }
            </Typography>,
          dialogProps: {
            transitionDuration: 0,
            id: 'confirmDialog',
          },
          confirmationButtonProps: {
            size: 'small',
            color: 'secondary',
            style: { marginRight: 15, marginBottom: 10 },
            variant: 'outlined',
          },
          cancellationButtonProps: {
            size: 'small',
            style: { marginRight: 5, marginBottom: 10 },
            variant: 'outlined',
          },
        }
      }
    >
      {children}
    </ConfirmProvider>
  )
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
                    <ConfirmIntlProvider>
                      <Router history={history}>
                        <ScrollReset/>
                        <RouteList/>
                        {
                          REACT_QUERY_DEV_TOOLS &&
                          <ReactQueryDevtools initialIsOpen={Boolean(true)} panelProps={{ style: { height: 400 } }}/>
                        }
                      </Router>
                    </ConfirmIntlProvider>
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
