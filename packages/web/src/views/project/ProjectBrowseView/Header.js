import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Breadcrumbs,
  Button,
  Grid,
  Link,
  SvgIcon,
  Typography,
  makeStyles,
} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { PlusCircle as PlusIcon } from 'react-feather';

const useStyles = makeStyles(() => ({
  root: {},
}));

const Header = ({ className, ...rest }) => {
  const classes = useStyles();

  return (
    <Grid
      alignItems="center"
      className={clsx(classes.root, className)}
      container
      justify="space-between"
      spacing={3}
      {...rest}
    >
      <Grid item>
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
            to="/app/projects"
            variant="body1"
          >
            Projects
          </Link>
          <Typography
            color="textPrimary"
            variant="body1"
          >
            Browse
          </Typography>
        </Breadcrumbs>
        <Typography
          color="textPrimary"
          variant="h3"
        >
          See the latest opportunities
        </Typography>
      </Grid>
      <Grid item>
        <Button
          color="secondary"
          component={RouterLink}
          startIcon={
            <SvgIcon fontSize="small">
              <PlusIcon />
            </SvgIcon>
          }
          to="/app/projects/create"
          variant="contained"
        >
          Add new project
        </Button>
      </Grid>
    </Grid>
  );
}

Header.propTypes = {
  className: PropTypes.string,
};

export default Header;
