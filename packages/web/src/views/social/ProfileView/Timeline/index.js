import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { Box, Grid, makeStyles } from '@material-ui/core'
import axios from 'src/utils/axios'
import useIsMountedRef from 'src/hooks/useIsMountedRef'
import PostAdd from 'src/components/PostAdd'
import PostCard from 'src/components/PostCard'
import About from './About'
import log from '@adapter/common/src/log'

const useStyles = makeStyles(() => ({
  root: {},
}))

const Timeline = ({ className, profile, ...rest }) => {
  const classes = useStyles()
  const isMountedRef = useIsMountedRef()
  const [posts, setPosts] = useState([])
  
  const getPosts = useCallback(async () => {
    try {
      const response = await axios.get('/api/social/posts')
      
      if (isMountedRef.current) {
        setPosts(response.data.posts)
      }
    } catch (err) {
      log.error(err)
    }
  }, [isMountedRef])
  
  useEffect(() => {
    getPosts()
  }, [getPosts])
  
  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Grid
        container
        spacing={3}
      >
        <Grid
          item
          lg={4}
          md={6}
          xs={12}
        >
          <About profile={profile}/>
        </Grid>
        <Grid
          item
          lg={8}
          md={6}
          xs={12}
        >
          <PostAdd/>
          {
            posts.map((post) => (
              <Box
                key={post.id}
                mt={3}
              >
                <PostCard post={post}/>
              </Box>
            ))
          }
        </Grid>
      </Grid>
    </div>
  )
}

Timeline.propTypes = {
  className: PropTypes.string,
  profile: PropTypes.object.isRequired,
}

export default Timeline
