import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Markdown from 'react-markdown/with-html';
import {
  Box,
  Chip,
  Card,
  CardContent,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {},
  markdown: {
    fontFamily: theme.typography.fontFamily,
    '& p': {
      marginBottom: theme.spacing(2),
    },
  },
}));

const Brief = ({ className, project, ...rest }) => {
  const classes = useStyles();

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardContent>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            md={6}
            xs={12}
          >
            <Typography
              color="textSecondary"
              variant="subtitle2"
            >
              Project Name
            </Typography>
            <Typography
              color="textPrimary"
              variant="h6"
            >
              {project.title}
            </Typography>
            <Box mt={3}>
              <Typography
                color="textSecondary"
                variant="subtitle2"
              >
                Tags
              </Typography>
              <Box mt={1}>
                {
                  project.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      variant="outlined"
                    />
                  ))
                }
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Box mt={3}>
          <Typography
            color="textSecondary"
            variant="subtitle2"
          >
            Description
          </Typography>
          <Markdown
            className={classes.markdown}
            source={project.description}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

Brief.propTypes = {
  className: PropTypes.string,
  project: PropTypes.object.isRequired,
};

export default Brief;
