import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { Box, Button, Container, makeStyles, Typography, } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    paddingTop: 128,
    paddingBottom: 128,
  },
  browseButton: {
    marginLeft: theme.spacing(2),
  },
}));

const CTA = ({ className, ...rest }) => {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Container maxWidth="lg">
        <Typography
          align="center"
          color="textPrimary"
          variant="h1"
        >
          Ready to start building?
        </Typography>
        <Typography
          align="center"
          color="secondary"
          variant="h1"
        >
          Download Devias Material Kit today.
        </Typography>
        <Box
          alignItems="center"
          display="flex"
          justifyContent="center"
          mt={6}
        >
          <Button
            color="secondary"
            component="a"
            href="https://material-ui.com/store/items/devias-kit-pro"
            variant="contained"
          >
            Get the kit
          </Button>
        </Box>
      </Container>
    </div>
  );
};

CTA.propTypes = {
  className: PropTypes.string,
};

export default CTA;
