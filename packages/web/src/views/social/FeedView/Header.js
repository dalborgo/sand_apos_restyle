import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {},
}));

const Header = ({ className, ...rest }) => {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Typography
        color="textSecondary"
        variant="overline"
      >
        Social Feed
      </Typography>
      <Typography
        color="textPrimary"
        variant="h3"
      >
        Here&apos;s what your connections posted
      </Typography>
    </div>
  );
};

Header.propTypes = {
  className: PropTypes.string,
};

export default Header;
