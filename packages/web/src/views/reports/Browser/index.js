import React, { useEffect, useState } from 'react'
import {
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
  Paper,
} from '@material-ui/core'
import { useInfiniteQuery } from 'react-query'
import Page from 'src/components/Page'
import Header from './Header'
import DocList from './DocList'
import PerfectScrollbar from 'react-perfect-scrollbar'
import SearchIcon from '@material-ui/icons/Search'
import CloseIcon from '@material-ui/icons/Close'
import { axiosLocalInstance } from 'src/utils/reactQueryFunctions'
import log from '@adapter/common/src/log'
import { useHistory } from 'react-router'

const LIMIT = 40
const focus = event => event.target.select()
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
  circularProgress: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
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
  const history = useHistory()
  /*const { docId } = useParams()
  console.log('docId:', docId)*/
  useEffect(() => {
    const browserSearchBox = document.getElementById('browserSearchBox')
    browserSearchBox.select()
    const browserPanel = document.getElementById('browserPanel')
    browserPanel.scrollTop = 0
  }, [text])
  const response = useInfiniteQuery(['docs/browser', text], fetchFunc, {
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
            <Box
              alignItems="center"
              className={classes.box}
              display="flex"
              px={2}
              py={1}
            >
              <form autoComplete="off" onSubmit={event => event.preventDefault()} style={{ width: '100%' }}>
                <Box alignItems="center" display="flex" mb={0}>
                  <Box flexGrow={1} mr={2}>
                    <FormControl fullWidth size={'small'}>
                      <Input
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              onClick={
                                event => {
                                  event.persist()
                                  const browserSearchBox = document.getElementById('browserSearchBox')
                                  browserSearchBox.value = ''
                                  if (text) {
                                    setText('')
                                  } else {
                                    browserSearchBox.focus()
                                  }
                                }
                              }
                              style={{ padding: 8 }}
                            >
                              <CloseIcon/>
                            </IconButton>
                          </InputAdornment>
                        }
                        id="browserSearchBox"
                        onFocus={focus}
                      />
                    </FormControl>
                  </Box>
                  <Box>
                    <IconButton
                      color="primary"
                      onClick={
                        event => {
                          event.persist()
                          const filter = document.getElementById('browserSearchBox').value
                          history.push('/app/reports/browser')
                          setText(filter)
                        }
                      }
                      type="submit"
                    >
                      <SearchIcon/>
                    </IconButton>
                  </Box>
                </Box>
              </form>
            </Box>
            <div className={classes.browserArea} id="browserPanel">
              {
                response.isLoading ?
                  <div className={classes.circularProgress}>
                    <CircularProgress/>
                  </div>
                  :
                  <PerfectScrollbar options={{ suppressScrollX: true }}>
                    <DocList {...response}/>
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
