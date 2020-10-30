import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { Box, Container, Divider, Grid, makeStyles, Typography, } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
    '& dt': {
      marginTop: theme.spacing(2),
    },
  },
}));

const FAQS = ({ className, ...rest }) => {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Container maxWidth="lg">
        <Typography
          color="textPrimary"
          variant="h1"
        >
          Frequently asked questions
        </Typography>
        <Box my={3}>
          <Divider />
        </Box>
        <Grid
          component="dl"
          container
          spacing={3}
        >
          <Grid
            item
            md={6}
            xs={12}
          >
            <Typography
              color="secondary"
              variant="overline"
            >
              Technical &amp; Licensing
            </Typography>
            <Box mt={6}>
              <dt>
                <Typography
                  color="textPrimary"
                  variant="h4"
                >
                  What do we use for styling our components?
                </Typography>
              </dt>
              <dd>
                <Typography
                  color="textSecondary"
                  variant="body1"
                >
                  We use Material-ui&apos;s hooks api as we think it’s
                  the best way of avoiding clutter.
                </Typography>
              </dd>
            </Box>
            <Box mt={6}>
              <dt>
                <Typography
                  color="textPrimary"
                  variant="h4"
                >
                  Is Typescript available?
                </Typography>
              </dt>
              <dd>
                <Typography
                  color="textSecondary"
                  variant="body1"
                >
                  Yes, we have the Typescript version available for Standard Plus and Extended license.
                </Typography>
              </dd>
            </Box>
            <Box mt={6}>
              <dt>
                <Typography
                  color="textPrimary"
                  variant="h4"
                >
                  Are you providing support for setting up my project?
                </Typography>
              </dt>
              <dd>
                <Typography
                  color="textSecondary"
                  variant="body1"
                >
                  Yes, we offer email support for all our customers &amp;
                  even skype meetings for our extended license customers.
                </Typography>
              </dd>
            </Box>
          </Grid>
          <Grid
            item
            md={6}
            xs={12}
          >
            <Typography
              color="secondary"
              variant="overline"
            >
              Design
            </Typography>
            <Box mt={6}>
              <dt>
                <Typography
                  color="textPrimary"
                  variant="h4"
                >
                  Are the design files (Sketch, Figma) included in the Standard License?
                </Typography>
              </dt>
              <dd>
                <Typography
                  color="textSecondary"
                  variant="body1"
                >
                  No, we offer the design source file only to Standard Plus and Extended License.
                </Typography>
              </dd>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

FAQS.propTypes = {
  className: PropTypes.string,
};

export default FAQS;
