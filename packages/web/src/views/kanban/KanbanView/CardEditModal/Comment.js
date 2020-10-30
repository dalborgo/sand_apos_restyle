import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import moment from 'moment';
import {
  Avatar,
  Box,
  Paper,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { useSelector } from 'src/store';

const memberSelector = (state, memberId) => {
  const { members } = state.kanban;

  return members.byId[memberId];
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    marginBottom: theme.spacing(2),
  },
  messageContainer: {
    backgroundColor: theme.palette.background.dark,
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
  },
}));

const Comment = ({
  comment,
  className,
  ...rest
}) => {
  const classes = useStyles();
  const member = useSelector((state) => memberSelector(state, comment.memberId));

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Avatar
        alt="Person"
        src={member.avatar}
      />
      <Box
        flexGrow={1}
        ml={2}
      >
        <Typography
          color="textPrimary"
          gutterBottom
          variant="h5"
        >
          {member.name}
        </Typography>
        <Paper
          className={classes.messageContainer}
          variant="outlined"
        >
          <Typography
            color="textPrimary"
            variant="body2"
          >
            {comment.message}
          </Typography>
        </Paper>
        <Typography
          color="textSecondary"
          variant="caption"
        >
          {moment(comment.createdAt).format('MMM DD, YYYY [at] hh:mm a')}
        </Typography>
      </Box>
    </div>
  );
};

Comment.propTypes = {
  className: PropTypes.string,
  comment: PropTypes.object.isRequired,
};

export default Comment;
