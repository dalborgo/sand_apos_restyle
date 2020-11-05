import React, { memo } from 'react'
import { Box, CircularProgress, FormControl, IconButton, Input, InputAdornment, makeStyles } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import SearchIcon from '@material-ui/icons/Search'
import LockIcon from '@material-ui/icons/LockOutlined'
import LockOpenIcon from '@material-ui/icons/LockOpen'
import ReplayIcon from '@material-ui/icons/Replay'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'
import { useHistory } from 'react-router'

const focus = event => event.target.select()

const useStyles = makeStyles(theme => ({
  wrapper: {
    position: 'relative',
  },
  lockedButton: {
    color: theme.palette.primary.main,
  },
  notLockedButton: {
    color: theme.palette.error.main,
  },
  progress: {
    color: theme.palette.primary.main,
    position: 'absolute',
    top: 4,
    left: 4,
  },
}))

const InputText = memo(function BrowserInputText ({ text, setText }) {
  const history = useHistory()
  return (
    <FormControl fullWidth size="small">
      <Input
        autoFocus
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              id="clearText"
              onClick={
                () => {
                  const browserSearchBox = document.getElementById('browserSearchBox')
                  browserSearchBox.value = ''
                  if (text) {
                    history.push('/app/reports/browser')
                    setText('')
                    const elem = document.getElementById('browserDisplayArea')
                    if (elem) {
                      elem.value = ''
                    }
                  } else {
                    browserSearchBox.focus()
                  }
                }
              }
              style={{ padding: 8, visibility: text ? 'visible' : 'hidden' }}
            >
              <CloseIcon/>
            </IconButton>
          </InputAdornment>
        }
        id="browserSearchBox"
        onChange={
          event => {
            const val = event.target.value
            const clearText = document.getElementById('clearText')
            if (!val && !text) {
              clearText.style.visibility = 'hidden'
            } else {
              clearText.style.visibility = 'visible'
            }
          }
        }
        onFocus={focus}
      />
    </FormControl>
  )
})

const SearchBox = memo(function SearchBox ({
  isFetchingDoc,
  isFetchingList,
  text,
  setText,
  refetch,
  refetchLine,
  locked,
  setLocked,
  isSuccessDoc,
  isSuccessList,
}) {
  console.log('%cRENDER_SEARCH', 'color: cyan')
  const classes = useStyles()
  const history = useHistory()
  const checkLoading = (isFetchingDoc && !isSuccessDoc) || (isFetchingList && !isSuccessList)
  console.log('isFetchingDoc:', isFetchingDoc)
  console.log('isSuccessDoc:', isSuccessDoc)
  return (
    <Box
      alignItems="center"
      display="flex"
      pt={1}
      px={2}
    >
      <form autoComplete="off" onSubmit={event => event.preventDefault()} style={{ width: '100%' }}>
        <Box alignItems="center" display="flex" mb={0}>
          <Box flexGrow={1} mr={2}>
            <InputText setText={setText} text={text}/>
          </Box>
          <Box display="flex">
            <IconButton
              color="primary"
              onClick={
                () => {
                  const filter = document.getElementById('browserSearchBox').value
                  if (filter !== text) {
                    history.push('/app/reports/browser')
                    setText(filter)
                    const elem = document.getElementById('browserDisplayArea')
                    if (elem) {
                      elem.value = ''
                    }
                  }
                }
              }
              type="submit"
            >
              <SearchIcon/>
            </IconButton>
            <IconButton
              className={locked ? classes.lockedButton : classes.notLockedButton}
              onClick={() => setLocked(state => !state)}
              type="submit"
            >
              {locked ? <LockIcon/> : <LockOpenIcon/>}
            </IconButton>
            <div className={classes.wrapper}>
              <IconButton
                color="primary"
                onClick={
                  () => {
                    refetch()
                    refetchLine()
                  }
                }
              >
                {checkLoading ? <HourglassEmptyIcon/> : <ReplayIcon/>}
              </IconButton>
              {(checkLoading) && <CircularProgress className={classes.progress} size={40} thickness={2}/>}
            </div>
          </Box>
        </Box>
      </form>
    </Box>
  )
})

export default SearchBox
