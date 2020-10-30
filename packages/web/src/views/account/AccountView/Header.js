import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { Breadcrumbs, Link, makeStyles, Typography } from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'

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
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
      >
        <Link color="inherit" component={RouterLink} to="/app">
          Dashboard
        </Link>
        <Typography color="textPrimary">
          Account
        </Typography>
      </Breadcrumbs>
      <Typography
        color="textPrimary"
        variant="h3"
      >
        Settings
      </Typography>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string,
};

export default Header;
