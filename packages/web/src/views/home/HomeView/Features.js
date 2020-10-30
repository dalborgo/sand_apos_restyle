import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { Avatar, Box, Button, Container, Grid, makeStyles, Typography, } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    paddingTop: 128,
    paddingBottom: 128,
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
}));

const Features = ({ className, ...rest }) => {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Container maxWidth="lg">
        <Typography
          align="center"
          color="secondary"
          component="p"
          variant="overline"
        >
          Explore Devias Kit Pro
        </Typography>
        <Typography
          align="center"
          color="textPrimary"
          variant="h1"
        >
          Not just a pretty face
        </Typography>
        <Box mt={8}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              md={4}
              xs={12}
            >
              <Box display="flex">
                <Avatar className={classes.avatar}>
                  01
                </Avatar>
                <Box ml={2}>
                  <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h4"
                  >
                    Complete User Flows
                  </Typography>
                  <Typography
                    color="textPrimary"
                    variant="body1"
                  >
                    Not just a set of tools, the package includes the most common use cases of
                    user flows like User Management, Second Level Layout.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <Box display="flex">
                <Avatar className={classes.avatar}>
                  02
                </Avatar>
                <Box ml={2}>
                  <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h4"
                  >
                    Support for Plugins
                  </Typography>
                  <Typography
                    color="textPrimary"
                    variant="body1"
                  >
                    The kit provides support for multiple third-party plugins right out of the box
                    like Chart.js, Dropzone.js, Kanban Plugin and many more.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <Box display="flex">
                <Avatar className={classes.avatar}>
                  03
                </Avatar>
                <Box ml={2}>
                  <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="h4"
                  >
                    Designers, we got you
                  </Typography>
                  <Typography
                    color="textPrimary"
                    gutterBottom
                    variant="body1"
                  >
                    We&apos;ve included the source Sketch &amp; Figma files to Plus &amp;
                    Extended licenses so you can get creative! Build layouts with confidence.
                  </Typography>
                  <Button
                    component="a"
                    href="https://sketch.cloud/s/q4a8e"
                    target="_blank"
                    variant="outlined"
                  >
                    Preview Design
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </div>
  );
};

Features.propTypes = {
  className: PropTypes.string,
};

export default Features;
