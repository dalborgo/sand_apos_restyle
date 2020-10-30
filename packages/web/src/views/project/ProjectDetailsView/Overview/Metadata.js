import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import moment from 'moment';
import numeral from 'numeral';
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Link,
  List,
  ListItem,
  Typography,
  makeStyles,
} from '@material-ui/core';
import getInitials from 'src/utils/getInitials';

const useStyles = makeStyles((theme) => ({
  root: {},
  header: {
    paddingBottom: 0,
  },
  content: {
    paddingTop: 0,
  },
  listItem: {
    padding: theme.spacing(2, 0),
    justifyContent: 'space-between',
  },
}));

const Metadata = ({ className, project, ...rest }) => {
  const classes = useStyles();

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardHeader
        avatar={
          (
            <Avatar
              alt="Author"
              component={RouterLink}
              src={project.author.avatar}
              to="#"
            >
              {getInitials(project.author.name)}
            </Avatar>
          )
        }
        className={classes.header}
        disableTypography
        subheader={
          (
            <Link
              color="textPrimary"
              component={RouterLink}
              to="#"
              underline="none"
              variant="h6"
            >
              {project.author.name}
            </Link>
          )
        }
        title={
          (
            <Typography
              color="textSecondary"
              display="block"
              variant="overline"
            >
            Contest holder
            </Typography>
          )
        }
      />
      <CardContent className={classes.content}>
        <List>
          <ListItem
            className={classes.listItem}
            disableGutters
            divider
          >
            <Typography
              color="textPrimary"
              variant="subtitle2"
            >
              Deadline
            </Typography>
            <Typography
              color="textSecondary"
              variant="h6"
            >
              {moment(project.endDate).format('DD MMM YYYY')}
            </Typography>
          </ListItem>
          <ListItem
            className={classes.listItem}
            disableGutters
            divider
          >
            <Typography
              color="textPrimary"
              variant="subtitle2"
            >
              Budget
            </Typography>
            <Typography
              color="textSecondary"
              variant="h6"
            >
              {numeral(project.budget).format(`${project.currency}0,0.00`)}
            </Typography>
          </ListItem>
          <ListItem
            className={classes.listItem}
            disableGutters
            divider
          >
            <Typography
              color="textPrimary"
              variant="subtitle2"
            >
              Last Update
            </Typography>
            <Typography
              color="textSecondary"
              variant="h6"
            >
              {moment(project.updatedAt).format('DD MMM YYYY')}
            </Typography>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

Metadata.propTypes = {
  className: PropTypes.string,
  project: PropTypes.object.isRequired,
};

export default Metadata;
