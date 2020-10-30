import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Card,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core';
import Label from 'src/components/Label';

const useStyles = makeStyles((theme) => ({
  root: {},
  item: {
    padding: theme.spacing(3),
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
      '&:not(:last-of-type)': {
        borderRight: `1px solid ${theme.palette.divider}`,
      },
    },
    [theme.breakpoints.down('sm')]: {
      '&:not(:last-of-type)': {
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
    },
  },
  valueContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginLeft: theme.spacing(1),
  },
}));

const Overview = ({ className, ...rest }) => {
  const classes = useStyles();
  const overview = {
    income: '854,355.00',
    expanses: '373,250.50',
    profit: '123,532.00',
    subscriptions: '26,000',
  };

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Grid
        alignItems="center"
        container
        justify="space-between"
      >
        <Grid
          className={classes.item}
          item
          md={3}
          sm={6}
          xs={12}
        >
          <Typography
            color="textSecondary"
            component="h2"
            gutterBottom
            variant="overline"
          >
            Total Income
          </Typography>
          <div className={classes.valueContainer}>
            <Typography
              color="textPrimary"
              variant="h3"
            >
              $
              {overview.income}
            </Typography>
            <Label
              className={classes.label}
              color="success"
            >
              +25%
            </Label>
          </div>
        </Grid>
        <Grid
          className={classes.item}
          item
          md={3}
          sm={6}
          xs={12}
        >
          <Typography
            color="textSecondary"
            component="h2"
            gutterBottom
            variant="overline"
          >
            Total Expanses
          </Typography>
          <div className={classes.valueContainer}>
            <Typography
              color="textPrimary"
              variant="h3"
            >
              $
              {overview.expanses}
            </Typography>
            <Label
              className={classes.label}
              color="success"
            >
              +12%
            </Label>
          </div>
        </Grid>
        <Grid
          className={classes.item}
          item
          md={3}
          sm={6}
          xs={12}
        >
          <Typography
            color="textSecondary"
            component="h2"
            gutterBottom
            variant="overline"
          >
            Net Profit
          </Typography>
          <div className={classes.valueContainer}>
            <Typography
              color="textPrimary"
              variant="h3"
            >
              {overview.profit}
            </Typography>
            <Label
              className={classes.label}
              color="error"
            >
              -20%
            </Label>
          </div>
        </Grid>
        <Grid
          className={classes.item}
          item
          md={3}
          sm={6}
          xs={12}
        >
          <Typography
            color="textSecondary"
            component="h2"
            gutterBottom
            variant="overline"
          >
            Active Subscriptions
          </Typography>
          <div className={classes.valueContainer}>
            <Typography
              color="textPrimary"
              variant="h3"
            >
              {overview.subscriptions}
            </Typography>
          </div>
        </Grid>
      </Grid>
    </Card>
  );
};

Overview.propTypes = {
  className: PropTypes.string,
};

export default Overview;
