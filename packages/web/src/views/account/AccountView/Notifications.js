import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core'
import wait from 'src/utils/wait'

const useStyles = makeStyles(() => ({
  root: {},
}));

const Notifications = ({ className, ...rest }) => {
  const classes = useStyles();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // NOTE: Make API request
    await wait(500);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card
        className={clsx(classes.root, className)}
        {...rest}
      >
        <CardHeader title="Notifications" />
        <Divider />
        <CardContent>
          <Grid
            container
            spacing={6}
            wrap="wrap"
          >
            <Grid
              item
              md={4}
              sm={6}
              xs={12}
            >
              <Typography
                color="textPrimary"
                gutterBottom
                variant="h6"
              >
                System
              </Typography>
              <Typography
                color="textSecondary"
                gutterBottom
                variant="body2"
              >
                You will recieve emails in your business email address
              </Typography>
              <div>
                <FormControlLabel
                  control={(
                    <Checkbox defaultChecked />
                  )}
                  label="Email alerts"
                />
              </div>
              <div>
                <FormControlLabel
                  control={<Checkbox />}
                  label="Push Notifications"
                />
              </div>
              <div>
                <FormControlLabel
                  control={(
                    <Checkbox defaultChecked />
                  )}
                  label="Text message"
                />
              </div>
              <div>
                <FormControlLabel
                  control={(
                    <Checkbox defaultChecked />
                  )}
                  label={
                    (
                      <>
                        <Typography
                          color="textPrimary"
                          variant="body1"
                        >
                        Phone calls
                        </Typography>
                        <Typography variant="caption">
                        Short voice phone updating you
                        </Typography>
                      </>
                    )
                  }
                />
              </div>
            </Grid>
            <Grid
              item
              md={4}
              sm={6}
              xs={12}
            >
              <Typography
                color="textPrimary"
                gutterBottom
                variant="h6"
              >
                Chat App
              </Typography>
              <Typography
                color="textSecondary"
                gutterBottom
                variant="body2"
              >
                You will recieve emails in your business email address
              </Typography>
              <div>
                <FormControlLabel
                  control={(
                    <Checkbox defaultChecked />
                  )}
                  label="Email"
                />
              </div>
              <div>
                <FormControlLabel
                  control={(
                    <Checkbox defaultChecked />
                  )}
                  label="Push notifications"
                />
              </div>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box
          display="flex"
          justifyContent="flex-end"
          p={2}
        >
          <Button
            color="secondary"
            type="submit"
            variant="contained"
          >
            Save Settings
          </Button>
        </Box>
      </Card>
    </form>
  );
};

Notifications.propTypes = {
  className: PropTypes.string,
};

export default Notifications;
