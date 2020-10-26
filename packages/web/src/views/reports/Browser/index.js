import React, { memo, useEffect, useState } from 'react'
import { Box, makeStyles, Paper } from '@material-ui/core'
import { useInfiniteQuery, useMutation, useQuery } from 'react-query'
import Page from 'src/components/Page'
import Header from './Header'
import DocList from './DocList'
import SearchBox from './SearchBox'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { axiosLocalInstance } from 'src/utils/reactQueryFunctions'
import log from '@adapter/common/src/log'
import { useParams } from 'react-router'
import CommandBox from './CommandBox'
import Divider from '@material-ui/core/Divider'

const LIMIT = 40

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
    padding: theme.spacing(2),
    width: '100%',
  },
  docList: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
    width: '40%',
  },
  editDoc: {
    marginLeft: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
    width: '60%',
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
  displayArea: {
    border: 0,
    fontFamily: 'monospace',
    overflow: 'auto',
    padding: 10,
    resize: 'none',
    width: '100%',
    height: '100%',
  },
}))

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
const fetchFunc2 = async (key, docId) => {
  const { data } = await axiosLocalInstance(`/api/${key}`, {
    params: {
      docId,
    },
  })
  return data
}
const saveMutation = async (docs) => {
  const { data } = await axiosLocalInstance.post('/api/docs/bulk', {
    docs: [docs],
  })
  return data
}

const SearchComponent = memo((props => {
  console.log('%cRENDER_SearchComponent', 'color: green')
  return (
    <Paper className={props.classes.docList} elevation={2}>
      <SearchBox
        isFetching={props.isFetching}
        refetch={props.refetch}
        refetchLine={props.refetchLine}
        setText={props.setText}
        text={props.text}
      />
      <div className={props.classes.browserArea} id="browserPanel">
        {
          !props.isLoading &&
          <PerfectScrollbar options={{ suppressScrollX: true }}>
            <DocList
              canFetchMore={props.canFetchMore}
              data={props.data}
              fetchMore={props.fetchMore}
              isFetchingMore={props.isFetchingMore}
            />
          </PerfectScrollbar>
        }
      </div>
    </Paper>
  )
}))

SearchComponent.displayName = 'SearchComponent'

const DisplayComponent = memo((props => {
  console.log('%cRENDER_DisplayComponent', 'color: silver')
  const docObj = props?.data?.results
  const defaultValue = docObj ? JSON.stringify(docObj, null, 2) : ''
  return (
    <Paper className={props.classes.editDoc} elevation={2}>
      <CommandBox mutate={props.mutate}/>
      <Divider/>
      {
        docObj &&
        <React.Fragment key={docObj._id}>
          <textarea
            className={props.classes.displayArea}
            defaultValue={defaultValue}
            id={'textA'}
          />
        </React.Fragment>
      }
    </Paper>
  )
}))

DisplayComponent.displayName = 'DisplayComponent'

const BrowserView = () => {
  console.log('%cRENDER_BASE', 'color: purple')
  const classes = useStyles()
  const [text, setText] = useState('')
  const { docId } = useParams()
  useEffect(() => {
    const browserSearchBox = document.getElementById('browserSearchBox')
    browserSearchBox.select()
    const browserPanel = document.getElementById('browserPanel')
    browserPanel.scrollTop = 0
  }, [text])
  const respList = useInfiniteQuery(['docs/browser', text], fetchFunc, {
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
  const respDoc = useQuery(['docs/get_by_id', docId], fetchFunc2, {
    enabled: docId,
  })
  const [mutate] = useMutation(saveMutation, {
    onSettled: (data, error, variables) => {
      if (data?.results) {
        const [first] = data.results
        const outObj = Object.assign(variables, { _rev: first.rev })
        document.getElementById('textA').value = JSON.stringify(outObj, null, 2)
      }
      respList.refetch()
      respDoc.refetch()
    },
  })
  const displayBody = {
    data: respDoc.data,
    mutate,
  }
  const searchBody = {
    data: respList.data,
    fetchMore: respList.fetchMore,
    canFetchMore: respList.canFetchMore,
    isFetchingMore: respList.isFetchingMore,
    isLoading: respList.isLoading,
    isFetching: respList.isFetching || respDoc.isFetching,
    refetch: respList.refetch,
    refetchLine: respDoc.refetch,
  }
  return (
    <Page
      className={classes.root}
      title="Browser"
    >
      <Box p={3} pb={2}>
        <Header/>
      </Box>
      <div className={classes.content}>
        <div className={classes.innerFirst}>
          <SearchComponent
            classes={classes}
            setText={setText}
            text={text}
            {...searchBody}
          />
          <DisplayComponent classes={classes} {...displayBody}/>
        </div>
      </div>
    </Page>
  )
}

export default BrowserView
