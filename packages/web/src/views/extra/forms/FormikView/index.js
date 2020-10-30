import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Breadcrumbs, Container, Grid, Link, makeStyles, Typography, } from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import Page from 'src/components/Page'
import BasicForm from './BasicForm'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
}));

const FormikView = () => {
  const classes = useStyles();

  return (
    <Page
      className={classes.root}
      title="Formik Form"
    >
      <Container maxWidth="lg">
        <Breadcrumbs
          aria-label="breadcrumb"
          separator={<NavigateNextIcon fontSize="small" />}
        >
          <Link
            color="inherit"
            component={RouterLink}
            to="/app"
            variant="body1"
          >
            Dashboard
          </Link>
          <Typography
            color="textPrimary"
            variant="body1"
          >
            Forms
          </Typography>
        </Breadcrumbs>
        <Typography
          color="textPrimary"
          variant="h3"
        >
          Formik
        </Typography>
        <Box mt={3}>
          <Grid container>
            <Grid
              item
              md={6}
              xs={12}
            >
              <BasicForm />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Page>
  );
};

export default FormikView;
