import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Avatar,
  Box,
  Container,
  Typography,
  makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    paddingTop: 128,
    paddingBottom: 128,
  },
  title: {
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

const Testimonials = ({ className, ...rest }) => {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Container maxWidth="md">
        <Typography
          align="center"
          className={classes.title}
          color="textPrimary"
          variant="h2"
        >
          &quot;Devias builds some of the best templates you can find for React.
          <br />
          They will save you time.&quot;
        </Typography>
        <Box
          alignItems="center"
          display="flex"
          justifyContent="center"
          mt={6}
        >
          <Avatar src="/static/home/olivier.png" />
          <Box ml={2}>
            <Typography
              color="textPrimary"
              variant="body1"
            >
              Olivier Tassinari
              <Typography
                color="textSecondary"
                component="span"
                display="inline"
              >
                , co-creator of @MaterialUI
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

Testimonials.propTypes = {
  className: PropTypes.string,
};

export default Testimonials;
