import React, { memo, useCallback } from 'react'
import { Box, Button, makeStyles, Typography } from '@material-ui/core'

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

const CommandBox = memo(({ mutate }) => {
  console.log('%cRENDER_COMMAND_BOX', 'color: cyan')
  const classes = useStyles()
  const save = useCallback(async event => {
    const textArea = document.getElementById('textA')
    const docs = JSON.parse(textArea.value)
    await mutate(docs)
  }, [mutate])
  return (
    <Box
      alignItems="center"
      className={classes.root}
      display="flex"
      px={2}
      py={1}
    >
      <Box flexGrow={1}>
        <Typography>Text</Typography>
      </Box>
      <Box>
        <Button color="primary" onClick={save} size="small" variant="contained">Salva</Button>
      </Box>
    </Box>
  )
})

CommandBox.displayName = 'SearchBox'

export default CommandBox
