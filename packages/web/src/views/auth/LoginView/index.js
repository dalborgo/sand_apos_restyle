import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Link,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core'
import Page from 'src/components/Page'
import useAuth from 'src/hooks/useAuth'
import Auth0Login from './Auth0Login'
import FirebaseAuthLogin from './FirebaseAuthLogin'
import JWTLogin from './JWTLogin'
import { FormattedMessage } from 'react-intl'

const methodIcons = {
  Auth0: '/static/images/auth0.svg',
  FirebaseAuth: '/static/images/firebase.svg',
  JWT: '/static/images/jwt.svg',
}

const useStyles = makeStyles((theme) => ({
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
    height: 30,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
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
            <Chip
              className={classes.bannerChip}
              color="secondary"
              label="NEW"
              size="small"
            />
            <Box
              alignItems="center"
              display="flex"
            >
              <Typography
                color="textPrimary"
                variant="h6"
              >
                Visit our
                {' '}
                <Link
                  component={RouterLink}
                  to="/docs"
                >
                  docs
                </Link>
                {' '}
                and find out how to switch between
              </Typography>
              <Tooltip title="Auth0">
                <img
                  alt="Auth0"
                  className={classes.methodIcon}
                  src={methodIcons['Auth0']}
                />
              </Tooltip>
              <Tooltip title="Firebase">
                <img
                  alt="Firebase"
                  className={classes.methodIcon}
                  src={methodIcons['FirebaseAuth']}
                />
              </Tooltip>
              <Tooltip title="JSON Web Token">
                <img
                  alt="JWT"
                  className={classes.methodIcon}
                  src={methodIcons['JWT']}
                />
              </Tooltip>
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
                mb={3}
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
                    alt="Auth method"
                    src={methodIcons[method]}
                  />
                </div>
              </Box>
              <Box
                flexGrow={1}
                mt={3}
              >
                {method === 'Auth0' && <Auth0Login/>}
                {method === 'FirebaseAuth' && <FirebaseAuthLogin/>}
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
