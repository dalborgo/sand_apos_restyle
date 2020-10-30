import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import moment from 'moment';
import {
  Box,
  Button,
  Grid,
  SvgIcon,
  Typography,
  makeStyles,
} from '@material-ui/core';
import {
  Share2 as ShareIcon,
  Check as CheckIcon,
  Calendar as CalendarIcon,
  AlertTriangle as AlertIcon,
  Send as SendIcon,
} from 'react-feather';
import ApplyModal from './ApplyModal';

const useStyles = makeStyles((theme) => ({
  root: {},
  badge: {
    display: 'flex',
    alignItems: 'center',
    margin: theme.spacing(2),
  },
  badgeIcon: {
    marginRight: theme.spacing(1),
  },
  action: {
    marginBottom: theme.spacing(1),
    '& + &': {
      marginLeft: theme.spacing(1),
    },
  },
}));

const Header = ({ className, project, ...rest }) => {
  const classes = useStyles();
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);

  const handleApplyModalOpen = () => {
    setApplyModalOpen(true);
  };

  const handleApplyModalClose = () => {
    setApplyModalOpen(false);
  };

  return (
    <Grid
      className={clsx(classes.root, className)}
      container
      justify="space-between"
      spacing={3}
      {...rest}
    >
      <Grid item>
        <Typography
          color="textPrimary"
          variant="h3"
        >
          {project.title}
        </Typography>
        <Box
          alignItems="center"
          color="text.secondary"
          display="flex"
          flexWrap="wrap"
          mx={-2}
        >
          <div className={classes.badge}>
            <SvgIcon
              className={classes.badgeIcon}
              fontSize="small"
            >
              {project.isActive ? <CheckIcon /> : <AlertIcon /> }
            </SvgIcon>
            <Typography
              color="inherit"
              component="span"
              variant="body2"
            >
              {project.isActive ? 'Active' : 'Inactive'}
            </Typography>
          </div>
          <div className={classes.badge}>
            <SvgIcon
              className={classes.badgeIcon}
              fontSize="small"
            >
              <CalendarIcon />
            </SvgIcon>
            <Typography
              color="inherit"
              component="span"
              variant="body2"
            >
              {`Deadline ${moment(project.endDate).fromNow()}`}
            </Typography>
          </div>
        </Box>
      </Grid>
      <Grid item>
        <Button
          className={classes.action}
          startIcon={
            <SvgIcon fontSize="small">
              <ShareIcon />
            </SvgIcon>
          }
        >
          Share
        </Button>
        <Button
          className={classes.action}
          color="secondary"
          onClick={handleApplyModalOpen}
          startIcon={
            <SvgIcon fontSize="small">
              <SendIcon />
            </SvgIcon>
          }
          variant="contained"
        >
          Apply for a role
        </Button>
        <ApplyModal
          author={project.author}
          onApply={handleApplyModalClose}
          onClose={handleApplyModalClose}
          open={isApplyModalOpen}
        />
      </Grid>
    </Grid>
  );
};

Header.propTypes = {
  className: PropTypes.string,
  project: PropTypes.object.isRequired,
};

export default Header;
