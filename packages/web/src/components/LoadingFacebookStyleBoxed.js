import React from 'react'
import { Box, CircularProgress, makeStyles } from '@material-ui/core'

const useStylesFacebook = makeStyles(theme => ({
  root: {
    position: 'relative',
  },
  bottom: {
    color: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  top: {
    color: theme.palette.secondary.main,
    animationDuration: '550ms',
    position: 'absolute',
    left: 0,
  },
  circle: {
    strokeLinecap: 'round',
  },
}));

function LoadingFacebookStyleBoxed(props) {
  const classes = useStylesFacebook();
  return (
    <Box
      alignItems="center"
      display="flex"
      height="100%"
      justifyContent="center"
    >
      <div className={classes.root}>
        <CircularProgress
          className={classes.bottom}
          size={50}
          thickness={3.5}
          variant="determinate"
          {...props}
          value={100}
        />
        <CircularProgress
          classes={
            {
              circle: classes.circle,
            }
          }
          className={classes.top}
          disableShrink
          size={50}
          thickness={3.5}
          {...props}
        />
      </div>
    </Box>
  );
}

export default LoadingFacebookStyleBoxed
