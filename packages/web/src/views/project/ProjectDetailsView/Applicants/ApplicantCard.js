import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Link,
  Typography,
  makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {},
  media: {
    height: 125,
  },
  content: {
    paddingTop: 0,
  },
  avatar: {
    height: 64,
    width: 64,
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}));

const ApplicantCard = ({ className, applicant, ...rest }) => {
  const classes = useStyles();

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardMedia
        className={classes.media}
        image={applicant.cover}
      />
      <CardContent className={classes.content}>
        <Box
          display="flex"
          justifyContent="center"
          mb={2}
          mt={-4}
        >
          <Avatar
            alt="Applicant"
            className={classes.avatar}
            component={RouterLink}
            src={applicant.avatar}
            to="#"
          />
        </Box>
        <Link
          align="center"
          color="textPrimary"
          component={RouterLink}
          display="block"
          to="#"
          underline="none"
          variant="h6"
        >
          {applicant.name}
        </Link>
        <Typography
          align="center"
          color="textSecondary"
          variant="body2"
        >
          {applicant.commonConnections}
          {' '}
          contacts in common
        </Typography>
        <Box my={2}>
          <Divider />
        </Box>
        {
          applicant.labels.map((label) => (
            <Chip
              className={classes.chip}
              key={label}
              label={label}
              variant="outlined"
            />
          ))
        }
      </CardContent>
    </Card>
  );
}

ApplicantCard.propTypes = {
  className: PropTypes.string,
  applicant: PropTypes.object.isRequired,
};

export default ApplicantCard;
