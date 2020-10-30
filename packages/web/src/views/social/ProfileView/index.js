import React, { useCallback, useEffect, useState } from 'react'
import { Box, Container, Divider, makeStyles, Tab, Tabs } from '@material-ui/core'
import axios from 'src/utils/axios'
import useIsMountedRef from 'src/hooks/useIsMountedRef'
import Page from 'src/components/Page'
import Header from './Header'
import Timeline from './Timeline'
import Connections from './Connections'
import log from '@adapter/common/src/log'
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
  },
}))

const ProfileView = () => {
  const classes = useStyles()
  const isMountedRef = useIsMountedRef()
  const [currentTab, setCurrentTab] = useState('timeline')
  const [profile, setProfile] = useState(null)
  
  const tabs = [
    { value: 'timeline', label: 'Timeline' },
    { value: 'connections', label: 'Connections' },
  ]
  
  const handleTabsChange = (event, value) => {
    setCurrentTab(value)
  }
  
  const getPosts = useCallback(async () => {
    try {
      const response = await axios.get('/api/social/profile')
      
      if (isMountedRef.current) {
        setProfile(response.data.profile)
      }
    } catch (err) {
      log.error(err)
    }
  }, [isMountedRef])
  
  useEffect(() => {
    getPosts().then()
  }, [getPosts])
  
  if (!profile) {
    return null
  }
  
  return (
    <Page
      className={classes.root}
      title="Profile"
    >
      <Header profile={profile}/>
      <Container maxWidth="lg">
        <Box mt={3}>
          <Tabs
            onChange={handleTabsChange}
            scrollButtons="auto"
            textColor="secondary"
            value={currentTab}
            variant="scrollable"
          >
            {
              tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                />
              ))
            }
          </Tabs>
        </Box>
        <Divider/>
        <Box
          pb={6}
          py={3}
        >
          {currentTab === 'timeline' && <Timeline profile={profile}/>}
          {currentTab === 'connections' && <Connections/>}
        </Box>
      </Container>
    </Page>
  )
}

export default ProfileView
