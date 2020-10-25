import React, { useEffect, useState } from 'react'
import { Box, makeStyles, Paper, } from '@material-ui/core'
import { useInfiniteQuery } from 'react-query'
import Page from 'src/components/Page'
import Header from './Header'
import DocList from './DocList'
import SearchBox from './SearchBox'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { axiosLocalInstance } from 'src/utils/reactQueryFunctions'
import log from '@adapter/common/src/log'

const LIMIT = 40

const fetchFunc = async (key, text, cursor) => {
  const { data } = await axiosLocalInstance(`/api/${key}`, {
    params: {
      limit: LIMIT,
      startkey: cursor,
      text: text || undefined,
    },
  })
  return data
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    height: '100%',
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  box: {
    backgroundColor: 'none',
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    display: 'flex',
    overflowY: 'hidden',
    overflowX: 'auto',
  },
  innerFirst: {
    display: 'flex',
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(2),
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
    width: 430,
  },
  browserArea: {
    flexGrow: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}))

const BrowserView = () => {
  const classes = useStyles()
  const [text, setText] = useState('')
  console.log('%cRENDER_BASE', 'color: purple')
  /*const { docId } = useParams()
  console.log('docId:', docId)*/
  useEffect(() => {
    const browserSearchBox = document.getElementById('browserSearchBox')
    browserSearchBox.select()
    const browserPanel = document.getElementById('browserPanel')
    browserPanel.scrollTop = 0
  }, [text])
  const {
    data,
    fetchMore,
    canFetchMore,
    isFetchingMore,
    isLoading,
    isFetching,
    refetch,
  } = useInfiniteQuery(['docs/browser', text], fetchFunc, {
    getFetchMore: (lastGroup, allGroups) => {
      const { total_rows: totalRows, rows = [] } = lastGroup?.results
      const cursor = rows[rows.length - 1]?.key
      const rowsFetched = allGroups.length * LIMIT
      const isOver = !LIMIT || rowsFetched === totalRows || rows.length < LIMIT
      return isOver ? false : parseInt(cursor)
    },
    onError: err => {
      log.error(err.message)
      setText('')
    },
  })
  return (
    <Page
      className={classes.root}
      title="Browser"
    >
      <Box p={3}>
        <Header/>
      </Box>
      <div className={classes.content}>
        <div className={classes.innerFirst}>
          <Paper className={classes.inner} elevation={2}>
            <SearchBox isFetching={isFetching} refetch={refetch} setText={setText} text={text}/>
            <div className={classes.browserArea} id="browserPanel">
              {
                !isLoading &&
                <PerfectScrollbar options={{ suppressScrollX: true }}>
                  <DocList
                    canFetchMore={canFetchMore}
                    data={data}
                    fetchMore={fetchMore}
                    isFetchingMore={isFetchingMore}
                  />
                </PerfectScrollbar>
              }
            </div>
          </Paper>
        </div>
      </div>
    </Page>
  )
}

export default BrowserView
