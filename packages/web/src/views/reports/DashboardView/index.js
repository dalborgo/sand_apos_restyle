import React from 'react'
import { Container, Grid, makeStyles, withWidth } from '@material-ui/core'
import Page from 'src/components/Page'
import ErrorSuspenseWrapper from 'src/components/ErrorSuspenseWrapper'
import Header from './Header'
import LatestProjects from './LatestProjects'
import NewProjects from './NewProjects'
import PerformanceOverTime from './PerformanceOverTime'
import RealTime from './RealTime'
import RoiPerCustomer from './RoiPerCustomer'
import SystemHealth from './SystemHealth'
import TeamTasks from './TeamTasks'
import BestEarning from './BestEarning'
import clsx from 'clsx'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  sameHeight: {
    minHeight: 143,
  },
}))

const DashboardView = ({ width }) => {
  const classes = useStyles()
  
  return (
    <Page
      className={classes.root}
      title="Dashboard"
    >
      <Container maxWidth={false}>
        <Header/>
        <Grid
          container
          spacing={3}
        >
          <Grid
            className={clsx({ [classes.sameHeight]: width !== 'xs' })}
            item
            lg={3}
            sm={6}
            xs={12}
          >
            <ErrorSuspenseWrapper>
              <BestEarning/>
            </ErrorSuspenseWrapper>
          </Grid>
          <Grid
            item
            lg={3}
            sm={6}
            xs={12}
          >
            <NewProjects/>
          </Grid>
          <Grid
            item
            lg={3}
            sm={6}
            xs={12}
          >
            <SystemHealth/>
          </Grid>
          <Grid
            item
            lg={3}
            sm={6}
            xs={12}
          >
            <RoiPerCustomer/>
          </Grid>
          <Grid
            item
            lg={3}
            xs={12}
          >
            <RealTime/>
          </Grid>
          <Grid
            item
            lg={9}
            xs={12}
          >
            <PerformanceOverTime/>
          </Grid>
          <Grid
            item
            lg={5}
            xl={4}
            xs={12}
          >
            <TeamTasks/>
          </Grid>
          <Grid
            item
            lg={7}
            xl={8}
            xs={12}
          >
            <LatestProjects/>
          </Grid>
        </Grid>
      </Container>
    </Page>
  )
}

export default withWidth()(DashboardView)
