import React, { memo } from 'react'
import { Box, CircularProgress, FormControl, IconButton, Input, InputAdornment, makeStyles } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import SearchIcon from '@material-ui/icons/Search'
import ReplayIcon from '@material-ui/icons/Replay'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'
import { useHistory } from 'react-router'

const focus = event => event.target.select()

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: 'none',
  },
  wrapper: {
    position: 'relative',
  },
  progress: {
    color: theme.palette.primary.main,
    position: 'absolute',
    top: 2,
    left: 2,
  },
}))

const SearchBox = memo(({ isFetching, text, setText, refetch, refetchLine }) => {
  console.log('%cRENDER_SEARCH', 'color: cyan')
  const classes = useStyles()
  const history = useHistory()
  return (
    <Box
      alignItems="center"
      className={classes.root}
      display="flex"
      px={2}
      py={1}
    >
      <form autoComplete="off" onSubmit={event => event.preventDefault()} style={{ width: '100%' }}>
        <Box alignItems="center" display="flex" mb={0}>
          <Box flexGrow={1} mr={2}>
            <FormControl fullWidth size="small">
              <Input
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={
                        () => {
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
          <Box display="flex">
            <IconButton
              color="primary"
              onClick={
                () => {
                  const filter = document.getElementById('browserSearchBox').value
                  if (filter !== text) {
                    history.push('/app/reports/browser')
                    setText(filter)
                  }
                }
              }
              type="submit"
            >
              <SearchIcon/>
            </IconButton>
            <div className={classes.wrapper}>
              <IconButton
                aria-label="save"
                color="primary"
                onClick={
                  () => {
                    refetch()
                    refetchLine()
                  }
                }
              >
                {isFetching ? <HourglassEmptyIcon/> : <ReplayIcon/>}
              </IconButton>
              {isFetching && <CircularProgress className={classes.progress} size={46}/>}
            </div>
          </Box>
        </Box>
      </form>
    </Box>
  )
})

SearchBox.displayName = 'SearchBox'

export default SearchBox
