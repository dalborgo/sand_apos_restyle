import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  LinearProgress,
  Typography,
  makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  progress: {
    margin: theme.spacing(0, 1),
    flexGrow: 1,
  },
}));

const SystemHealth = ({ className, ...rest }) => {
  const classes = useStyles();
  const data = {
    value: 97,
  };

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Typography
        color="textSecondary"
        component="h3"
        gutterBottom
        variant="overline"
      >
        System Health
      </Typography>
      <Box
        alignItems="center"
        display="flex"
        flexWrap="wrap"
      >
        <Typography
          color="textPrimary"
          variant="h3"
        >
          {data.value}
          %
        </Typography>
        <LinearProgress
          className={classes.progress}
          color="secondary"
          value={data.value}
          variant="determinate"
        />
      </Box>
    </Card>
  );
};

SystemHealth.propTypes = {
  className: PropTypes.string,
};

export default SystemHealth;
