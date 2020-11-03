import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Box, Grid, makeStyles, Paper } from '@material-ui/core'
import { useInfiniteQuery, useMutation, useQuery, useQueryCache } from 'react-query'
import Page from 'src/components/Page'
import DocList from './DocList'
import SearchBox from './SearchBox'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { axiosLocalInstance, useSnackQueryError } from 'src/utils/reactQueryFunctions'
import { useParams } from 'react-router'
import Header from './Header'
import { useSnackbar } from 'notistack'
import SaveIcon from '@material-ui/icons/Save'
import Fab from '@material-ui/core/Fab'
import Hidden from '@material-ui/core/Hidden'
import Dialog from '@material-ui/core/Dialog'

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
    paddingTop: theme.spacing(1),
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      padding: 0,
    },
  },
  docList: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  editDoc: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  gridItem: {
    height: '100%',
  },
  floatIcon: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(3),
    color: theme.palette.primary.main,
    opacity: 0.9,
    [theme.breakpoints.down('xs')]: {
      top: theme.spacing(2),
      right: theme.spacing(2),
    },
  },
  browserArea: {
    flexGrow: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingTop: theme.spacing(0),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  displayArea: {
    backgroundColor: 'transparent',
    border: 0,
    color: theme.palette.text.primary,
    fontFamily: 'monospace',
    height: '100%',
    outline: 'none',
    overflow: 'auto',
    padding: 10,
    resize: 'none',
    scrollbarWidth: 'thin',
    whiteSpace: 'pre',
    width: '100%',
  },
}))

const fetchList = async (key, text, cursor) => {
  const { data } = await axiosLocalInstance(`/api/${key}`, {
    params: {
      limit: LIMIT,
      startkey: cursor,
      text: text || undefined,
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
const deleteMutation = async (docId) => {
  const { data } = await axiosLocalInstance.delete('/api/docs/delete', {
    data: {
      docId,
    },
  })
  return data
}

const SearchComponent = memo((function SearchComponent (props) {
  console.log('%cRENDER_SearchComponent', 'color: green')
  return (
    <Paper className={props.classes.docList} elevation={2}>
      <SearchBox
        isFetching={props.isFetching}
        locked={props.locked}
        refetch={props.refetch}
        refetchLine={props.refetchLine}
        setLocked={props.setLocked}
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
              locked={props.locked}
              remove={props.remove}
            />
          </PerfectScrollbar>
        }
      </div>
    </Paper>
  )
}))

const DisplayComponent = memo((function DisplayComponent (props) {
  console.log('%cRENDER_DisplayComponent', 'color: silver')
  const { enqueueSnackbar } = useSnackbar()
  const save = useCallback(async () => {
    try {
      const textArea = document.getElementById('browserDisplayArea')
      const docs = JSON.parse(textArea.value)
      await props.mutate(docs)
    } catch (err) {
      enqueueSnackbar(err.message)
    }
  }, [enqueueSnackbar, props])
  return (
    <Paper className={props.classes.editDoc} elevation={2}>
      {
        <div style={{ position: 'relative', height: '100%' }}>
          <textarea
            className={props.classes.displayArea}
            id="browserDisplayArea"
          />
          <Fab
            className={props.classes.floatIcon}
            disabled={!props.docId}
            onClick={save}
            size="small"
          >
            <SaveIcon/>
          </Fab>
        </div>
      }
    </Paper>
  )
}))

const BrowserView = () => {
  console.log('%cRENDER_BASE', 'color: purple')
  const queryCache = useQueryCache()
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [text, setText] = useState('')
  const [locked, setLocked] = useState(true)
  const { docId } = useParams()
  const prevDocID = useRef(null)
  const snackQueryError = useSnackQueryError()
  useEffect(() => {
    if (docId && docId !== prevDocID.current) {
      const elem = document.getElementById(prevDocID?.current)
      if (elem) {elem.classList.remove('MuiBrowserElem-containerSelected')}
    }
    if (docId) {
      prevDocID.current = docId
    }
  }, [docId])
  useEffect(() => {
    const browserSearchBox = document.getElementById('browserSearchBox')
    browserSearchBox && browserSearchBox.select()
    const browserPanel = document.getElementById('browserPanel')
    if (browserPanel) {
      browserPanel.scrollTop = 0
    }
  }, [text])
  const respList = useInfiniteQuery(['docs/browser', text], fetchList, {
    getFetchMore: (lastGroup, allGroups) => {
      const { total_rows: totalRows, rows = [] } = lastGroup?.results
      const cursor = rows[rows.length - 1]?.key
      const rowsFetched = allGroups.length * LIMIT
      const isOver = !LIMIT || rowsFetched === totalRows || rows.length < LIMIT
      return isOver ? false : parseInt(cursor)
    },
    onError: err => {
      snackQueryError(err)
      text && setText('')
    },
  })
  const respDoc = useQuery(['docs/get_by_id', { docId }], {
    enabled: docId,
    onSuccess: ({ results }) => {
      const docObj = results
      const defaultValue = docObj ? JSON.stringify(docObj, null, 2) : ''
      const elem = document.getElementById('browserDisplayArea')
      if (elem) {elem.value = defaultValue}
    },
  })
  const [mutate] = useMutation(saveMutation, {
    onSettled: (data, error, variables) => {
      if (error) {
        enqueueSnackbar(error.message)
      } else {
        if (data?.results) {
          const [first] = data.results
          if (first.error) {
            const message = `${first.error}: ${first.reason} (${first.status})`
            enqueueSnackbar(message)
          } else {
            const isNewDoc = variables._id !== docId
            let outObj = variables
            if (!isNewDoc) {
              outObj = Object.assign(outObj, { _rev: first.rev })
            }
            document.getElementById('browserDisplayArea').value = JSON.stringify(outObj, null, 2)
            const message = `${isNewDoc ? '[CREATED]' : '[UPDATED]'} rev. ${first.rev}`
            enqueueSnackbar(message, { variant: 'success' })
          }
        }
        queryCache.invalidateQueries('docs/browser').then()
        queryCache.invalidateQueries(['docs/get_by_id', docId]).then()
      }
    },
  })
  const [remove] = useMutation(deleteMutation, {
    onSettled: (data) => {
      const { ok, results } = data
      const message = `[DELETED] docId: ${results.docId}`
      enqueueSnackbar(message, { variant: ok ? 'success' : 'error' })
      queryCache.invalidateQueries('docs/browser').then()
    },
  })
  const searchBody = {
    canFetchMore: respList.canFetchMore,
    classes,
    data: respList.data,
    fetchMore: respList.fetchMore,
    isFetching: respList.isFetching || respDoc.isFetching,
    isFetchingMore: respList.isFetchingMore,
    isLoading: respList.isLoading,
    refetch: respList.refetch,
    refetchLine: respDoc.refetch,
    remove,
    setText,
    text,
    locked,
    setLocked,
  }
  const displayBody = {
    classes,
    docId,
    mutate,
  }
  return (
    <Page
      className={classes.root}
      title="Browser"
    >
      <Hidden xsDown>
        <Box p={3} pb={2}>
          <Header/>
        </Box>
        <div className={classes.content}>
          <div className={classes.innerFirst}>
            <Grid container spacing={2}>
              <Grid className={classes.gridItem} item sm={5}>
                <SearchComponent
                  {...searchBody}
                />
              </Grid>
              <Grid className={classes.gridItem} item sm={7}>
                <DisplayComponent
                  {...displayBody}
                />
              </Grid>
            </Grid>
          </div>
        </div>
      </Hidden>
      <Hidden smUp>
        <div className={classes.content}>
          <div className={classes.innerFirst}>
            <Grid container>
              <Grid className={classes.gridItem} item xs={12}>
                <SearchComponent
                  {...searchBody}
                />
              </Grid>
              <Grid className={classes.gridItem} item xs={12}>
                <Dialog
                  fullScreen
                  keepMounted
                  open={!!docId && !respDoc.isFetching}
                  transitionDuration={0}
                >
                  <DisplayComponent
                    {...displayBody}
                  />
                </Dialog>
              </Grid>
            </Grid>
          </div>
        </div>
      </Hidden>
    </Page>
  )
}

export default BrowserView
