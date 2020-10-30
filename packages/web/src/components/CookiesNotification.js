import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { Box, Button, Link, makeStyles, Portal, Typography } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    maxWidth: 600,
    position: 'fixed',
    bottom: 0,
    left: 0,
    margin: theme.spacing(3),
    padding: theme.spacing(3),
    outline: 'none',
    zIndex: 2000,
  },
  action: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
  },
}));

const CookiesNotification = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    Cookies.set('consent', 'true');
    setOpen(false);
  };

  useEffect(() => {
    const consent = Cookies.get('consent');

    if (!consent) {
      setOpen(true);
    }
  }, []);

  if (!open) {
    return null;
  }

  return (
    <Portal>
      <div className={classes.root}>
        <Typography
          color="inherit"
          variant="body1"
        >
          We use Cookies to ensure that we give you the best experience on our
          website. Read our
          {' '}
          <Link
            color="inherit"
            component="a"
            href="https://devias.io/privacy-policy"
            target="_blank"
            underline="always"
          >
            Privacy Policy
          </Link>
          .
        </Typography>
        <Box
          display="flex"
          justifyContent="flex-end"
          mt={2}
        >
          <Button
            className={classes.action}
            onClick={handleClose}
            variant="contained"
          >
            I Agree
          </Button>
        </Box>
      </div>
    </Portal>
  );
};

export default CookiesNotification;
