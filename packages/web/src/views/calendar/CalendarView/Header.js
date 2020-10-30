import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import clsx from 'clsx'
import PropTypes from 'prop-types'
import { Breadcrumbs, Button, Grid, Link, makeStyles, SvgIcon, Typography } from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import { PlusCircle as PlusCircleIcon } from 'react-feather'

const useStyles = makeStyles((theme) => ({
  root: {},
  action: {
    marginBottom: theme.spacing(1),
    '& + &': {
      marginLeft: theme.spacing(1),
    },
  },
}));

const Header = ({
  className,
  onAddClick,
  ...rest
}) => {
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
          <Typography
            color="textPrimary"
            variant="body1"
          >
            Calendar
          </Typography>
        </Breadcrumbs>
        <Typography
          color="textPrimary"
          variant="h3"
        >
          Here&apos;s what you planned
        </Typography>
      </Grid>
      <Grid item>
        <Button
          className={classes.action}
          color="secondary"
          onClick={onAddClick}
          startIcon={
            <SvgIcon fontSize="small">
              <PlusCircleIcon />
            </SvgIcon>
          }
          variant="contained"
        >
          New Event
        </Button>
      </Grid>
    </Grid>
  );
}

Header.propTypes = {
  className: PropTypes.string,
  onAddClick: PropTypes.func,
};

Header.defaultProps = {
  onAddClick: () => {},
};

export default Header;
