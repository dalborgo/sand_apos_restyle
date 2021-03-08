import React from 'react'
import { Box, Card, CardContent, Container, Link, makeStyles, Typography } from '@material-ui/core'
import Page from 'src/components/Page'
import useAuth from 'src/hooks/useAuth'
import JWTLogin from './JWTLogin'
import { FormattedMessage } from 'react-intl'
import getAppVersion from 'src/utils/appVersion'

const methodIcons = { JWT: '/static/images/cap.svg' }

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  banner: {
    backgroundColor: theme.palette.background.paper,
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  bannerChip: {
    marginRight: theme.spacing(2),
  },
  methodIcon: {
    height: 50,
  },
  cardContainer: {
    paddingBottom: 80,
    paddingTop: 80,
    height: '100%',
  },
  cardContent: {
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    minHeight: 400,
  },
  currentMethodIcon: {
    height: 40,
    '& > img': {
      width: 'auto',
      maxHeight: '100%',
    },
  },
}))

const LoginView = () => {
  const classes = useStyles()
  const { method } = useAuth()
  const appVersion = getAppVersion()
  return (
    <Page
      className={classes.root}
      title="Login"
    >
      <div className={classes.banner}>
        <Container maxWidth="md">
          <Box
            alignItems="center"
            display="flex"
            justifyContent="center"
          >
            <Box
              alignItems="center"
              display="flex"
            >
              <Typography
                color="textPrimary"
                variant="h6"
              >
                <Link
                  href={`/static/apk/${appVersion}`}
                >
                  <FormattedMessage defaultMessage="Scarica" id="common.download"/> {appVersion}
                </Link>
              </Typography>
            </Box>
          </Box>
        </Container>
      </div>
      <Container
        className={classes.cardContainer}
        maxWidth="sm"
      >
        <Box
          alignItems="center"
          css={{ height: '100%' }}
          display="flex"
        >
          <Card>
            <CardContent className={classes.cardContent}>
              <Box
                alignItems="center"
                display="flex"
                justifyContent="space-between"
              >
                <div>
                  <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h2"
                  >
                    <FormattedMessage defaultMessage="Entra" id="auth.login.enter"/>
                  </Typography>
                  <Typography
                    color="textSecondary"
                    variant="body2"
                  >
                    <FormattedMessage defaultMessage="Collegati alla piattaforma" id="auth.connect"/>
                  </Typography>
                </div>
                <div className={classes.currentMethodIcon}>
                  <img
                    alt="Cap logo"
                    className={classes.methodIcon}
                    src={methodIcons[method]}
                  />
                </div>
              </Box>
              <Box
                flexGrow={1}
                mt={3}
              >
                {method === 'JWT' && <JWTLogin/>}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Page>
  )
}

export default LoginView
