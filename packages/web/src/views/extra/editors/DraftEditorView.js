import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Breadcrumbs, Container, Link, makeStyles, Paper, Typography } from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import Page from 'src/components/Page'
import DraftEditor from 'src/components/DraftEditor'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
}))

const DraftEditorView = () => {
  const classes = useStyles()
  
  return (
    <Page
      className={classes.root}
      title="Formik Form"
    >
      <Container maxWidth="lg">
        <Breadcrumbs
          aria-label="breadcrumb"
          separator={<NavigateNextIcon fontSize="small"/>}
        >
          <Link
            color="inherit"
            component={RouterLink}
            to="/app"
            variant="body1"
          >
            Dashboard
          </Link>
          <Link
            color="inherit"
            component={RouterLink}
            to="/app/extra"
            variant="body1"
          >
            Extra
          </Link>
          <Typography
            color="textPrimary"
            variant="body1"
          >
            Editors
          </Typography>
        </Breadcrumbs>
        <Typography
          color="textPrimary"
          variant="h3"
        >
          DraftJS
        </Typography>
        <Box mt={3}>
          <Paper>
            <DraftEditor/>
          </Paper>
        </Box>
      </Container>
    </Page>
  )
}

export default DraftEditorView
