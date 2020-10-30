import React, { useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Link,
  Paper,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  Typography,
  colors,
  makeStyles,
  withStyles,
} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import {
  User as UserIcon,
  Star as StarIcon,
  Briefcase as BriefcaseIcon,
  File as FileIcon,
} from 'react-feather';
import Page from 'src/components/Page';
import UserDetails from './UserDetails';
import ProjectDetails from './ProjectDetails';
import ProjectDescription from './ProjectDescription';

const steps = [
  {
    label: 'User Details',
    icon: UserIcon,
  },
  {
    label: 'Project Details',
    icon: BriefcaseIcon,
  },
  {
    label: 'Project Description',
    icon: FileIcon,
  },
];

const CustomStepConnector = withStyles((theme) => ({
  vertical: {
    marginLeft: 19,
    padding: 0,
  },
  line: {
    borderColor: theme.palette.divider,
  },
}))(StepConnector);

const useCustomStepIconStyles = makeStyles((theme) => ({
  root: {},
  active: {
    backgroundColor: theme.palette.secondary.main,
    boxShadow: theme.shadows[10],
    color: theme.palette.secondary.contrastText,
  },
  completed: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
}));

const CustomStepIcon = ({ active, completed, icon }) => {
  const classes = useCustomStepIconStyles();

  const Icon = steps[icon - 1].icon;

  return (
    <Avatar
      className={
        clsx(classes.root, {
          [classes.active]: active,
          [classes.completed]: completed,
        })
      }
    >
      <Icon size="20" />
    </Avatar>
  );
};

CustomStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
  icon: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  avatar: {
    backgroundColor: colors.red[600],
  },
  stepper: {
    backgroundColor: 'transparent',
  },
}));

const ProjectCreateView  = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleComplete = () => {
    setCompleted(true);
  };

  return (
    <Page
      className={classes.root}
      title="Project Create"
    >
      <Container maxWidth="lg">
        <Box mb={3}>
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
              Projects
            </Typography>
          </Breadcrumbs>
          <Typography
            color="textPrimary"
            variant="h3"
          >
            Create Wizard &amp; Process
          </Typography>
        </Box>
        {
          !completed ? (
            <Paper>
              <Grid container>
                <Grid
                  item
                  md={3}
                  xs={12}
                >
                  <Stepper
                    activeStep={activeStep}
                    className={classes.stepper}
                    connector={<CustomStepConnector />}
                    orientation="vertical"
                  >
                    {
                      steps.map((step) => (
                        <Step key={step.label}>
                          <StepLabel StepIconComponent={CustomStepIcon}>
                            {step.label}
                          </StepLabel>
                        </Step>
                      ))
                    }
                  </Stepper>
                </Grid>
                <Grid
                  item
                  md={9}
                  xs={12}
                >
                  <Box p={3}>
                    {
                      activeStep === 0 && (
                        <UserDetails onNext={handleNext} />
                      )
                    }
                    {
                      activeStep === 1 && (
                        <ProjectDetails
                          onBack={handleBack}
                          onNext={handleNext}
                        />
                      )
                    }
                    {
                      activeStep === 2 && (
                        <ProjectDescription
                          onBack={handleBack}
                          onComplete={handleComplete}
                        />
                      )
                    }
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ) : (
            <Card>
              <CardContent>
                <Box
                  maxWidth={450}
                  mx="auto"
                >
                  <Box
                    display="flex"
                    justifyContent="center"
                  >
                    <Avatar className={classes.avatar}>
                      <StarIcon />
                    </Avatar>
                  </Box>
                  <Box mt={2}>
                    <Typography
                      align="center"
                      color="textPrimary"
                      variant="h3"
                    >
                    You are all done!
                    </Typography>
                  </Box>
                  <Box mt={2}>
                    <Typography
                      align="center"
                      color="textSecondary"
                      variant="subtitle1"
                    >
                    Donec ut augue sed nisi ullamcorper posuere sit amet eu mauris.
                    Ut eget mauris scelerisque.
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="center"
                    mt={2}
                  >
                    <Button
                      color="secondary"
                      component={RouterLink}
                      to="/app/projects/1"
                      variant="contained"
                    >
                    View your project
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )
        }
      </Container>
    </Page>
  );
};

export default ProjectCreateView;
