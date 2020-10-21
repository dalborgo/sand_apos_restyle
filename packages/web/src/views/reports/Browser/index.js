import React from 'react'
import { Box, Container, Divider, makeStyles, Paper, Typography } from '@material-ui/core'
import Page from 'src/components/Page'
import Header from './Header'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  container: {
    marginTop: theme.spacing(4),
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
    overflowY: 'hidden',
    overflowX: 'hidden',
    width: 380,
  },
  browserArea: {
    minHeight: 80,
    flexGrow: 1,
    overflowY: 'auto',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}))

const DashboardView = () => {
  const classes = useStyles()
  return (
    <Page
      className={classes.root}
      title="Browser"
    >
      <Container maxWidth={false}>
        <Header/>
        <div className={classes.container}>
          <Paper className={classes.inner}>
            <Box
              alignItems="center"
              display="flex"
              px={2}
              py={1}
            >
              <Typography
                color="inherit"
                variant="h5"
              >
                PlaceHolder Filter
              </Typography>
            </Box>
            <Divider/>
            <div className={classes.browserArea}>
              <Typography>
                PLACEHOLDER LISTA
              </Typography>
            </div>
          </Paper>
        </div>
      </Container>
    </Page>
  )
}

export default DashboardView
