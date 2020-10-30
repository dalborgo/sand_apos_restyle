import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { Breadcrumbs, Button, Grid, Link, makeStyles, SvgIcon, Typography } from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import { Edit as EditIcon } from 'react-feather'

const useStyles = makeStyles(() => ({
  root: {},
}));

const Header = ({ className, customer, ...rest }) => {
  const classes = useStyles();

  return (
    <Grid
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
            to="/app/management"
            variant="body1"
          >
            Management
          </Link>
          <Typography
            color="textPrimary"
            variant="body1"
          >
            Customers
          </Typography>
        </Breadcrumbs>
        <Typography
          color="textPrimary"
          variant="h3"
        >
          {customer.name}
        </Typography>
      </Grid>
      <Grid item>
        <Button
          color="secondary"
          component={RouterLink}
          startIcon={
            <SvgIcon fontSize="small">
              <EditIcon />
            </SvgIcon>
          }
          to="/app/management/customers/1/edit"
          variant="contained"
        >
          Edit
        </Button>
      </Grid>
    </Grid>
  );
};

Header.propTypes = {
  className: PropTypes.string,
  customer: PropTypes.object.isRequired,
};

export default Header;
