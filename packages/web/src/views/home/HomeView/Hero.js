import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Box,
  Container,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    paddingTop: 200,
    paddingBottom: 200,
    [theme.breakpoints.down('md')]: {
      paddingTop: 60,
      paddingBottom: 60,
    },
  },
  technologyIcon: {
    height: 40,
    margin: theme.spacing(1),
  },
  image: {
    perspectiveOrigin: 'left center',
    transformStyle: 'preserve-3d',
    perspective: 1500,
    '& > img': {
      maxWidth: '90%',
      height: 'auto',
      transform: 'rotateY(-35deg) rotateX(15deg)',
      backfaceVisibility: 'hidden',
      boxShadow: theme.shadows[16],
    },
  },
  shape: {
    position: 'absolute',
    top: 0,
    left: 0,
    '& > img': {
      maxWidth: '90%',
      height: 'auto',
    },
  },
}));

const Hero = ({ className, ...rest }) => {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            md={5}
            xs={12}
          >
            <Box
              display="flex"
              flexDirection="column"
              height="100%"
              justifyContent="center"
            >
              <Typography
                color="secondary"
                variant="overline"
              >
                Introducing
              </Typography>
              <Typography
                color="textPrimary"
                variant="h1"
              >
                Devias React Material Kit - PRO
              </Typography>
              <Box mt={3}>
                <Typography
                  color="textSecondary"
                  variant="body1"
                >
                  A professional kit that comes with ready-to-use Material-UI© components
                  developed with one common goal in mind, help you build faster &amp; beautiful
                  applications. Each component is fully customizable,
                  responsive and easy to integrate.
                </Typography>
              </Box>
              <Box mt={3}>
                <Grid
                  container
                  spacing={3}
                >
                  <Grid item>
                    <Typography
                      color="secondary"
                      variant="h1"
                    >
                      30+
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="overline"
                    >
                      Demo Pages
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      color="secondary"
                      variant="h1"
                    >
                      UX
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="overline"
                    >
                      Complete Flows
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      color="secondary"
                      variant="h1"
                    >
                      300+
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="overline"
                    >
                      Components
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Box mt={3}>
                <img
                  alt="Javascript"
                  className={classes.technologyIcon}
                  src="/static/images/javascript.svg"
                />
                <img
                  alt="Typescript"
                  className={classes.technologyIcon}
                  src="/static/images/typescript.svg"
                />
              </Box>
            </Box>
          </Grid>
          <Grid
            item
            md={7}
            xs={12}
          >
            <Box position="relative">
              <div className={classes.shape}>
                <img
                  alt="Shapes"
                  src="/static/home/shapes.svg"
                />
              </div>
              <div className={classes.image}>
                <img
                  alt="Presentation"
                  src="/static/home/dark-light.png"
                />
              </div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

Hero.propTypes = {
  className: PropTypes.string,
};

export default Hero;
