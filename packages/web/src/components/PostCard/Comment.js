import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import moment from 'moment'
import { Avatar, Box, Link, makeStyles, Typography } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    marginBottom: theme.spacing(2),
  },
  bubble: {
    borderRadius: theme.shape.borderRadius,
  },
}));

const Comment = ({ className, comment, ...rest }) => {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Avatar
        alt="Person"
        component={RouterLink}
        src={comment.author.avatar}
        to="#"
      />
      <Box
        bgcolor="background.dark"
        className={classes.bubble}
        flexGrow={1}
        ml={2}
        p={2}
      >
        <Box
          alignItems="center"
          display="flex"
          mb={1}
        >
          <Link
            color="textPrimary"
            component={RouterLink}
            to="#"
            variant="h6"
          >
            {comment.author.name}
          </Link>
          <Box flexGrow={1} />
          <Typography
            color="textSecondary"
            variant="caption"
          >
            {moment(comment.createdAt).fromNow()}
          </Typography>
        </Box>
        <Typography
          color="textPrimary"
          variant="body1"
        >
          {comment.message}
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
