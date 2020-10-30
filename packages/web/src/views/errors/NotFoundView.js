import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Container, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core'
import Page from 'src/components/Page'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3),
    paddingTop: 80,
    paddingBottom: 80,
  },
  image: {
    maxWidth: '100%',
    width: 560,
    maxHeight: 300,
    height: 'auto',
  },
}));

const NotFoundView = () => {
  const classes = useStyles();
  const theme = useTheme();
  const mobileDevice = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Page
      className={classes.root}
      title="404: Not found"
    >
      <Container maxWidth="lg">
        <Typography
          align="center"
          color="textPrimary"
          variant={mobileDevice ? 'h4' : 'h1'}
        >
          404: The page you are looking for isn’t here
        </Typography>
        <Typography
          align="center"
          color="textSecondary"
          variant="subtitle2"
        >
          You either tried some shady route or you
          came here by mistake. Whichever it is, try using the navigation.
        </Typography>
        <Box
          display="flex"
          justifyContent="center"
          mt={6}
        >
          <img
            alt="Under development"
            className={classes.image}
            src="/static/images/undraw_page_not_found_su7k.svg"
          />
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          mt={6}
        >
          <Button
            color="secondary"
            component={RouterLink}
            to="/"
            variant="outlined"
          >
            Back to home
          </Button>
        </Box>
      </Container>
    </Page>
  );
};

export default NotFoundView;
