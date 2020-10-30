import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { Box, Button, Card, CardContent, CardHeader, Divider, makeStyles, Typography } from '@material-ui/core'
import NotInterestedIcon from '@material-ui/icons/NotInterested'
import GetAppIcon from '@material-ui/icons/GetApp'
import DeleteIcon from '@material-ui/icons/DeleteOutline'

const useStyles = makeStyles((theme) => ({
  root: {},
  deleteAction: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
}));

const OtherActions = ({ className, ...rest }) => {
  const classes = useStyles();

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardHeader title="Other actions" />
      <Divider />
      <CardContent>
        <Box
          alignItems="flex-start"
          display="flex"
          flexDirection="column"
        >
          <Button startIcon={<NotInterestedIcon />}>
            Close Account
          </Button>
          <Button startIcon={<GetAppIcon />}>
            Export Data
          </Button>
        </Box>
        <Box
          mb={2}
          mt={1}
        >
          <Typography
            color="textSecondary"
            variant="body2"
          >
            Remove this customer’s data if he requested that, if not please
            be aware that what has been deleted can never brough back
          </Typography>
        </Box>
        <Button
          className={classes.deleteAction}
          startIcon={<DeleteIcon />}
        >
          Delete Account
        </Button>
      </CardContent>
    </Card>
  );
};

OtherActions.propTypes = {
  className: PropTypes.string,
};

export default OtherActions;
