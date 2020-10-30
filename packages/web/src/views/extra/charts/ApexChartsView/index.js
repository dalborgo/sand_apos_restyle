import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Breadcrumbs, Container, Grid, Link, makeStyles, Typography } from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import Page from 'src/components/Page'
import AreaChart from './AreaChart'
import LineChart from './LineChart'
import RadialChart from './RadialChart'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
}));

const ApexChartsView = () => {
  const classes = useStyles();

  return (
    <Page
      className={classes.root}
      title="ApexCharts"
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
            Charts
          </Typography>
        </Breadcrumbs>
        <Typography
          color="textPrimary"
          variant="h3"
        >
          ApexCharts
        </Typography>
        <Box mt={3}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
            >
              <LineChart />
            </Grid>
            <Grid
              item
              md={8}
              xs={12}
            >
              <AreaChart />
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <RadialChart />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Page>
  );
};

export default ApexChartsView;
