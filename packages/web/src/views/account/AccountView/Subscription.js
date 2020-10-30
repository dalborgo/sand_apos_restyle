import React, { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import log from '@adapter/common/src/log'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Link,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core'
import axios from 'src/utils/axios'
import useIsMountedRef from 'src/hooks/useIsMountedRef'

const useStyles = makeStyles((theme) => ({
  root: {},
  overview: {
    padding: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column-reverse',
      alignItems: 'flex-start',
    },
  },
  productImage: {
    marginRight: theme.spacing(1),
    height: 48,
    width: 48,
  },
  details: {
    padding: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
}));

const Subscription = ({ className, ...rest }) => {
  const classes = useStyles();
  const isMountedRef = useIsMountedRef();
  const [subscription, setSubscription] = useState(null);

  const getSubscription = useCallback(async () => {
    try {
      const response = await axios.get('/api/account/subscription');

      if (isMountedRef.current) {
        setSubscription(response.data.subscription);
      }
    } catch (err) {
      log.error(err)
    }
  }, [isMountedRef]);

  useEffect(() => {
    getSubscription();
  }, [getSubscription]);

  if (!subscription) {
    return null;
  }

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardHeader title="Manage your subscription" />
      <Divider />
      <CardContent>
        <Paper variant="outlined">
          <Box className={classes.overview}>
            <div>
              <Typography
                color="textPrimary"
                display="inline"
                variant="h4"
              >
                {subscription.currency}
                {subscription.price}
              </Typography>
              <Typography
                display="inline"
                variant="subtitle1"
              >
                /mo
              </Typography>
            </div>
            <Box
              alignItems="center"
              display="flex"
            >
              <img
                alt="Product"
                className={classes.productImage}
                src="/static/images/products/product_premium.svg"
              />
              <Typography
                color="textSecondary"
                variant="overline"
              >
                {subscription.name}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Box className={classes.details}>
            <div>
              <Typography
                color="textPrimary"
                variant="body2"
              >
                {`${subscription.proposalsLeft} proposals left`}
              </Typography>
              <Typography
                color="textPrimary"
                variant="body2"
              >
                {`${subscription.templatesLeft} templates`}
              </Typography>
            </div>
            <div>
              <Typography
                color="textPrimary"
                variant="body2"
              >
                {`${subscription.invitesLeft} invites left`}
              </Typography>
              <Typography
                color="textPrimary"
                variant="body2"
              >
                {`${subscription.adsLeft} ads left`}
              </Typography>
            </div>
            <div>
              {
                subscription.hasAnalytics && (
                  <Typography
                    color="textPrimary"
                    variant="body2"
                  >
                  Analytics dashboard
                  </Typography>
                )
              }
              {
                subscription.hasEmailAlerts && (
                  <Typography
                    color="textPrimary"
                    variant="body2"
                  >
                  Email alerts
                  </Typography>
                )
              }
            </div>
          </Box>
        </Paper>
        <Box
          display="flex"
          justifyContent="flex-end"
          mt={2}
        >
          <Button
            color="secondary"
            size="small"
            variant="contained"
          >
            Upgrade plan
          </Button>
        </Box>
        <Box mt={2}>
          <Typography
            color="textSecondary"
            variant="body2"
          >
            The refunds don&apos;t work once you have the subscription, but you can
            always
            {' '}
            <Link
              color="secondary"
              component={RouterLink}
              to="#"
            >
              Cancel your subscription
            </Link>
            .
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

Subscription.propTypes = {
  className: PropTypes.string,
};

export default Subscription;
