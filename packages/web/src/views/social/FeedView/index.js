import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  Box,
  Container,
  makeStyles,
} from '@material-ui/core';
import axios from 'src/utils/axios';
import useIsMountedRef from 'src/hooks/useIsMountedRef';
import Page from 'src/components/Page';
import PostAdd from 'src/components/PostAdd';
import PostCard from 'src/components/PostCard';
import Header from './Header';
import log from '@adapter/common/src/log'
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
}));

const SocialFeedView = () => {
  const classes = useStyles();
  const isMountedRef = useIsMountedRef();
  const [posts, setPosts] = useState([]);

  const getPosts = useCallback(async () => {
    try {
      const response = await axios.get('/api/social/feed');

      if (isMountedRef.current) {
        setPosts(response.data.posts);
      }
    } catch (err) {
      log.error(err)
    }
  }, [isMountedRef]);

  useEffect(() => {
    getPosts();
  }, [getPosts]);

  return (
    <Page
      className={classes.root}
      title="Social Feed"
    >
      <Container maxWidth="lg">
        <Header />
        <Box mt={3}>
          <PostAdd />
        </Box>
        {
          posts.map((post) => (
            <Box
              key={post.id}
              mt={3}
            >
              <PostCard post={post} />
            </Box>
          ))
        }
      </Container>
    </Page>
  );
};

export default SocialFeedView;
