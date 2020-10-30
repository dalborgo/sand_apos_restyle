import React from 'react';
import clsx from 'clsx';
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  makeStyles,
} from '@material-ui/core';
import Page from 'src/components/Page';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    height: '100%',
    paddingTop: 120,
    paddingBottom: 120,
  },
  product: {
    position: 'relative',
    padding: theme.spacing(5, 3),
    cursor: 'pointer',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
  productImage: {
    borderRadius: theme.shape.borderRadius,
    position: 'absolute',
    top: -24,
    left: theme.spacing(3),
    height: 48,
    width: 48,
    fontSize: 24,
  },
  recommendedProduct: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
  },
  chooseButton: {
    backgroundColor: theme.palette.common.white,
  },
}));

const PricingView = () => {
  const classes = useStyles();

  return (
    <Page
      className={classes.root}
      title="Pricing"
    >
      <Container maxWidth="sm">
        <Typography
          align="center"
          color="textPrimary"
          variant="h1"
        >
          Start today. Boost up your services!
        </Typography>
        <Box mt={3}>
          <Typography
            align="center"
            color="textSecondary"
            variant="subtitle1"
          >
            Welcome to the first platform created for freelancers and agencies
            for showcasing and finding the best clinets in the market.
            30% of our income goes into Whale Charity
          </Typography>
        </Box>
      </Container>
      <Box mt="160px">
        <Container maxWidth="lg">
          <Grid
            container
            spacing={4}
          >
            <Grid
              item
              md={4}
              xs={12}
            >
              <Paper
                className={classes.product}
                elevation={1}
              >
                <img
                  alt="Product"
                  className={classes.productImage}
                  src="/static/images/products/product_standard.svg"
                />
                <Typography
                  color="textSecondary"
                  component="h3"
                  gutterBottom
                  variant="overline"
                >
                  Standard
                </Typography>
                <div>
                  <Typography
                    color="textPrimary"
                    component="span"
                    display="inline"
                    variant="h3"
                  >
                    $5
                  </Typography>
                  <Typography
                    color="textSecondary"
                    component="span"
                    display="inline"
                    variant="subtitle2"
                  >
                    /month
                  </Typography>
                </div>
                <Typography
                  color="textSecondary"
                  variant="overline"
                >
                  Max 1 user
                </Typography>
                <Box my={2}>
                  <Divider />
                </Box>
                <Typography
                  color="textPrimary"
                  variant="body2"
                >
                  20 proposals/month
                  <br />
                  10 templates
                  <br />
                  Analytics dashboard
                  <br />
                  Email alerts
                </Typography>
                <Box my={2}>
                  <Divider />
                </Box>
                <Button
                  className={classes.chooseButton}
                  fullWidth
                  variant="contained"
                >
                  Choose
                </Button>
              </Paper>
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <Paper
                className={clsx(classes.product, classes.recommendedProduct)}
                elevation={1}
              >
                <img
                  alt="Product"
                  className={classes.productImage}
                  src="/static/images/products/product_premium--outlined.svg"
                />
                <Typography
                  color="inherit"
                  component="h3"
                  gutterBottom
                  variant="overline"
                >
                  Premium
                </Typography>
                <div>
                  <Typography
                    color="inherit"
                    component="span"
                    display="inline"
                    variant="h3"
                  >
                    $29
                  </Typography>
                  <Typography
                    color="inherit"
                    component="span"
                    display="inline"
                    variant="subtitle2"
                  >
                    /month
                  </Typography>
                </div>
                <Typography
                  color="inherit"
                  variant="overline"
                >
                  Max 3 user
                </Typography>
                <Box my={2}>
                  <Divider />
                </Box>
                <Typography
                  color="inherit"
                  variant="body2"
                >
                  20 proposals/month
                  <br />
                  10 templates
                  <br />
                  Analytics dashboard
                  <br />
                  Email alerts
                </Typography>
                <Box my={2}>
                  <Divider />
                </Box>
                <Button
                  className={classes.chooseButton}
                  fullWidth
                  variant="contained"
                >
                  Choose
                </Button>
              </Paper>
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <Paper
                className={classes.product}
                elevation={1}
              >
                <img
                  alt="Product"
                  className={classes.productImage}
                  src="/static/images/products/product_extended.svg"
                />
                <Typography
                  color="textSecondary"
                  component="h3"
                  gutterBottom
                  variant="overline"
                >
                  Extended
                </Typography>
                <div>
                  <Typography
                    color="textPrimary"
                    component="span"
                    display="inline"
                    variant="h3"
                  >
                    $259
                  </Typography>
                  <Typography
                    color="textSecondary"
                    component="span"
                    display="inline"
                    variant="subtitle2"
                  >
                    /month
                  </Typography>
                </div>
                <Typography
                  color="textSecondary"
                  variant="overline"
                >
                  Unlimited
                </Typography>
                <Box my={2}>
                  <Divider />
                </Box>
                <Typography
                  color="textPrimary"
                  variant="body2"
                >
                  All from above
                  <br />
                  Unlimited 24/7 support
                  <br />
                  Personalised Page
                  <br />
                  Advertise your profile
                </Typography>
                <Box my={2}>
                  <Divider />
                </Box>
                <Button
                  className={classes.chooseButton}
                  fullWidth
                  variant="contained"
                >
                  Choose
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Page>
  );
};

export default PricingView;
