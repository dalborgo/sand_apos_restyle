import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  colors,
  makeStyles,
} from '@material-ui/core';
import {
  Plus as PlusIcon,
  Home as HomeIcon,
  Mail as MailIcon,
  Briefcase as BriefcaseIcon,
} from 'react-feather';

const useStyles = makeStyles((theme) => ({
  root: {},
  jobAvatar: {
    backgroundColor: theme.palette.secondary.main,
  },
  cityAvatar: {
    backgroundColor: colors.red[600],
  },
}));

const About = ({ className, profile, ...rest }) => {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Card>
        <CardHeader title="Profile Progress" />
        <Divider />
        <CardContent>
          <LinearProgress
            value={profile.profileProgress}
            variant="determinate"
          />
          <Box mt={2}>
            <Typography
              color="textSecondary"
              variant="subtitle2"
            >
              50% Set Up Complete
            </Typography>
          </Box>
        </CardContent>
      </Card>
      <Box mt={3}>
        <Card>
          <CardHeader title="About" />
          <Divider />
          <CardContent>
            <Typography
              color="textSecondary"
              variant="subtitle2"
            >
              &quot;
              {profile.quote}
              &quot;
            </Typography>
            <List>
              <ListItem
                disableGutters
                divider
              >
                <ListItemAvatar>
                  <Avatar className={classes.jobAvatar}>
                    <BriefcaseIcon size="22" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    (
                      <Typography
                        color="textPrimary"
                        variant="body2"
                      >
                        {profile.currentJob.title}
                        {' '}
                      at
                        {' '}
                        <Link
                          color="textPrimary"
                          href="#"
                          variant="subtitle2"
                        >
                          {profile.currentJob.company}
                        </Link>
                      </Typography>
                    )
                  }
                  secondary={
                    (
                      <Typography
                        color="textSecondary"
                        variant="caption"
                      >
                      Past:
                        {profile.previousJob.title}
                        {' '}
                        <Link
                          color="textSecondary"
                          href="#"
                          variant="caption"
                        >
                          {profile.previousJob.company}
                        </Link>
                      </Typography>
                    )
                  }
                />
              </ListItem>
              <ListItem
                disableGutters
                divider
              >
                <ListItemAvatar>
                  <Avatar className={classes.cityAvatar}>
                    <PlusIcon size="22" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Add school or collage"
                  primaryTypographyProps={
                    {
                      variant: 'body2',
                      color: 'textSecondary',
                    }
                  }
                />
              </ListItem>
              <ListItem
                disableGutters
                divider
              >
                <ListItemAvatar>
                  <Avatar className={classes.cityAvatar}>
                    <HomeIcon size="22" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    (
                      <Typography
                        color="textPrimary"
                        variant="body2"
                      >
                      Lives in
                        {' '}
                        <Link
                          color="textPrimary"
                          href="#"
                          variant="subtitle2"
                        >
                          {profile.currentCity}
                        </Link>
                      </Typography>
                    )
                  }
                  secondary={
                    (
                      <Typography
                        color="textSecondary"
                        variant="caption"
                      >
                      Originally from
                        {' '}
                        <Link
                          color="textSecondary"
                          href="#"
                          variant="caption"
                        >
                          {profile.originCity}
                        </Link>
                      </Typography>
                    )
                  }
                />
              </ListItem>
              <ListItem
                disableGutters
                divider
              >
                <ListItemAvatar>
                  <Avatar className={classes.cityAvatar}>
                    <MailIcon size="22" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={profile.email}
                  primaryTypographyProps={
                    {
                      variant: 'body2',
                      color: 'textPrimary',
                    }
                  }
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

About.propTypes = {
  className: PropTypes.string,
  profile: PropTypes.object.isRequired,
};

export default About;
