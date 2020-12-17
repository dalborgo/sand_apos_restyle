import React from 'react'
import { Button, Container, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core'
import Page from 'src/components/Page'
import { FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router'

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
  grayText: {
    color: theme.palette.text.secondary,
    fontWeight: 400,
  },
}))

const Error404 = () => {
  const classes = useStyles()
  const theme = useTheme()
  const mobileDevice = useMediaQuery(theme.breakpoints.down('sm'))
  const history = useHistory()
  return (
    <Page
      className={classes.root}
      title="Error 404"
    >
      <Container maxWidth="lg">
        <Typography
          align="center"
          gutterBottom
          variant={mobileDevice ? 'h4' : 'h1'}
        >
          <FormattedMessage defaultMessage="404: La pagina che stai cercando non è qui!" id="error404.wrong_page" />
        </Typography>
        <Typography
          align="center"
          className={classes.grayText}
          gutterBottom
          variant={mobileDevice ? 'h5' : 'h3'}
        >
          Potresti non avere i privilegi per visualizzarla.
        </Typography>
        <Typography
          align="center"
          variant="subtitle2"
        >
          <FormattedMessage
            defaultMessage="Se hai digitato un collegamento nella barra degli indirizzi, prova ad utilizzare il menu di navigazione a
          sinistra."
            id="error404.goto_home_page_description"
          />
        </Typography>
        <div className={classes.imageContainer}>
          <img
            alt="Error 404"
            className={classes.image}
            src="/static/images/undraw_page_not_found_su7k.svg"
          />
        </div>
        <div className={classes.buttonContainer}>
          <Button
            color="primary"
            onClick={() => history.goBack()}
            variant="outlined"
          >
            <FormattedMessage defaultMessage="Torna alla pagina precedente" id="error404.go_back_button" />
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default Error404
