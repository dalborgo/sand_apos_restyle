import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { Button, Container, Typography, useMediaQuery, useTheme } from '@material-ui/core'
import PropTypes from 'prop-types'
import Page from 'src/components/Page'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { expandError } from 'src/utils/errors'

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3),
    paddingTop: 80,
    paddingBottom: 80,
  },
  pre: {
    backgroundColor: theme.palette.background.dark,
  },
  imageContainer: {
    marginTop: theme.spacing(6),
    display: 'flex',
    justifyContent: 'center',
  },
  image: {
    maxWidth: '100%',
    width: 560,
    maxHeight: 300,
    height: 'auto',
  },
  buttonContainer: {
    marginTop: theme.spacing(6),
    display: 'flex',
    justifyContent: 'center',
  },
}))

const Error500 = ({ error, resetErrorBoundary }) => {
  const classes = useStyles()
  const theme = useTheme()
  const intl = useIntl()
  const mobileDevice = useMediaQuery(theme.breakpoints.down('sm'))
  const { isNetworkError } = expandError(error)
  const message = isNetworkError ? intl.formatMessage(messages['network_error']) : error.message
  return (
    <Page
      className={classes.root}
      title="Error 500"
    >
      <Container maxWidth="lg">
        <Typography
          align="center"
          color="textPrimary"
          variant={mobileDevice ? 'h4' : 'h1'}
        >
          {
            isNetworkError ?
              <FormattedMessage defaultMessage="503: Servizio non disponibile!" id="error503.service_unavailable!"/>
              :
              <FormattedMessage defaultMessage="500: Ooops, qualcosa è andato storto!" id="error500.something_wrong"/>
          }
        </Typography>
        <Typography
          align="center"
          color="textSecondary"
          variant="subtitle2"
        >
          {
            !isNetworkError &&
            <FormattedMessage defaultMessage="Contatta i fornitori del programma." id="error500.contact_vendors"/>
          }
          {error && <pre className={classes.pre}>{message}</pre>}
        </Typography>
        <div className={classes.imageContainer}>
          {
            isNetworkError ?
              <img
                alt="Error 503"
                className={classes.image}
                src="static/images/undraw_server_down_s4lk.svg"
                title="undraw server down"
              />
              :
              <img
                alt="Error 500"
                className={classes.image}
                src="static/images/undraw_something_wrong.svg"
                title="undraw something wrong"
              />
          }
        </div>
        <div className={classes.buttonContainer}>
          {
            isNetworkError
              ?
              <Button
                color="secondary"
                onClick={() => window.location.reload()} //window.location.replace(window.location.origin)
                variant="outlined"
              >
                <FormattedMessage defaultMessage="Ricarica la pagina" id="error500.reload_current_page"/>
              </Button>
              :
              <Button
                color="secondary"
                onClick={() => resetErrorBoundary()}
                variant="outlined"
              >
                <FormattedMessage defaultMessage="Riprova" id="error500.retry"/>
              </Button>
          }
        </div>
      </Container>
    </Page>
  )
}
Error500.propTypes = {
  componentStack: PropTypes.any,
  error: PropTypes.any,
}

export default Error500
