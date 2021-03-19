import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { Box, Button, makeStyles, Paper, Portal, Typography } from '@material-ui/core'
import useSettings from 'src/hooks/useSettings'
import { THEMES } from 'src/constants'

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 420,
    position: 'fixed',
    top: 0,
    right: 0,
    margin: theme.spacing(3),
    outline: 'none',
    zIndex: 2000,
    padding: theme.spacing(2),
  },
}));

const SettingsNotification = () => {
  const classes = useStyles();
  const [isOpen, setOpen] = useState(false);
  const { saveSettings } = useSettings();

  const handleSwitch = () => {
    saveSettings({ theme: THEMES.light });
    Cookies.set('settingsUpdated', 'true');
    setOpen(false);
  };

  const handleClose = () => {
    Cookies.set('settingsUpdated', 'true');
    setOpen(false);
  };

  useEffect(() => {
    const settingsUpdated = Cookies.get('settingsUpdated');

    if (!settingsUpdated) {
      setOpen(true);
    }
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <Paper
        className={classes.root}
        elevation={3}
      >
        <Typography
          color="textPrimary"
          gutterBottom
          variant="h4"
        >
          Settings Updated
        </Typography>
        <Typography
          color="textSecondary"
          variant="body2"
        >
          We automatically updated your settings.
          You change the settings any time from your dashboard settings.
        </Typography>
        <Box
          display="flex"
          justifyContent="space-between"
          mt={2}
        >
          <Button onClick={handleClose}>
            Close
          </Button>
          <Button
            color="secondary"
            onClick={handleSwitch}
            variant="contained"
          >
            Switch
          </Button>
        </Box>
      </Paper>
    </Portal>
  );
};

export default SettingsNotification;
