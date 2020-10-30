import React, {
  useCallback,
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import numeral from 'numeral';
import {
  Box,
  Card,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core';
import axios from 'src/utils/axios';
import useIsMountedRef from 'src/hooks/useIsMountedRef';
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
  label: {
    marginLeft: theme.spacing(1),
  },
  overline: {
    marginTop: theme.spacing(1),
  },
}));

const Statistics = ({ className, ...rest }) => {
  const classes = useStyles();
  const isMountedRef = useIsMountedRef();
  const [statistics, setStatistics] = useState(null);

  const getStatistics = useCallback(async () => {
    try {
      const response = await axios.get('/api/projects/overview/statistics');
  
      if (isMountedRef.current) {
        setStatistics(response.data.statistics);
      }
    } catch (err) {
    
    }
  }, [isMountedRef]);

  useEffect(() => {
    getStatistics();
  }, [getStatistics]);

  if (!statistics) {
    return null;
  }

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
            color="textPrimary"
            variant="h2"
          >
            {numeral(statistics.nextPayout).format('$0,0.00')}
          </Typography>
          <Typography
            className={classes.overline}
            color="textSecondary"
            variant="overline"
          >
            Next payout
          </Typography>
        </Grid>
        <Grid
          className={classes.item}
          item
          md={3}
          sm={6}
          xs={12}
        >
          <Typography
            color="textPrimary"
            variant="h2"
          >
            {numeral(statistics.totalIncome).format('$0,0.00')}
          </Typography>
          <Typography
            className={classes.overline}
            color="textSecondary"
            variant="overline"
          >
            Total income
          </Typography>
        </Grid>
        <Grid
          className={classes.item}
          item
          md={3}
          sm={6}
          xs={12}
        >
          <Typography
            color="textPrimary"
            variant="h2"
          >
            {statistics.visitorsToday}
          </Typography>
          <Typography
            className={classes.overline}
            color="textSecondary"
            variant="overline"
          >
            Today&apos;s Visitors
          </Typography>
        </Grid>
        <Grid
          className={classes.item}
          item
          md={3}
          sm={6}
          xs={12}
        >
          <Box
            alignItems="center"
            display="flex"
            justifyContent="center"
          >
            <Typography
              color="textPrimary"
              component="span"
              variant="h2"
            >
              {statistics.watchingNow}
            </Typography>
            <Label
              className={classes.label}
              color="primary"
            >
              Live
            </Label>
          </Box>
          <Typography
            className={classes.overline}
            color="textSecondary"
            variant="overline"
          >
            Watching now
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
};

Statistics.propTypes = {
  className: PropTypes.string,
};

export default Statistics;
