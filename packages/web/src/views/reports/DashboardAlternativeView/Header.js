import React, {
  useRef,
  useState,
} from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Breadcrumbs,
  Button,
  Grid,
  Link,
  Menu,
  MenuItem,
  SvgIcon,
  Typography,
  makeStyles,
} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { Calendar as CalendarIcon } from 'react-feather';

const timeRanges = [
  {
    value: 'today',
    text: 'Today',
  },
  {
    value: 'yesterday',
    text: 'Yesterday',
  },
  {
    value: 'last_30_days',
    text: 'Last 30 days',
  },
  {
    value: 'last_year',
    text: 'Last year',
  },
];

const useStyles = makeStyles(() => ({
  root: {},
}));

const Header = ({ className, ...rest }) => {
  const classes = useStyles();
  const actionRef = useRef(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [timeRange, setTimeRange] = useState(timeRanges[2].text);

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
            Reports
          </Typography>
        </Breadcrumbs>
        <Typography
          color="textPrimary"
          variant="h3"
        >
          Finance Overview
        </Typography>
      </Grid>
      <Grid item>
        <Button
          onClick={() => setMenuOpen(true)}
          ref={actionRef}
          startIcon={
            <SvgIcon fontSize="small">
              <CalendarIcon />
            </SvgIcon>
          }
        >
          {timeRange}
        </Button>
        <Menu
          anchorEl={actionRef.current}
          anchorOrigin={
            {
              vertical: 'bottom',
              horizontal: 'center',
            }
          }
          getContentAnchorEl={null}
          onClose={() => setMenuOpen(false)}
          open={isMenuOpen}
          transformOrigin={
            {
              vertical: 'top',
              horizontal: 'center',
            }
          }
        >
          {
            timeRanges.map((_timeRange) => (
              <MenuItem
                key={_timeRange.value}
                onClick={() => setTimeRange(_timeRange.text)}
              >
                {_timeRange.text}
              </MenuItem>
            ))
          }
        </Menu>
      </Grid>
    </Grid>
  );
};

Header.propTypes = {
  className: PropTypes.string,
};

Header.defaultProps = {};

export default Header;
