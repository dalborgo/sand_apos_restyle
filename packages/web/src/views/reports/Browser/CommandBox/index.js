import React, { memo, useCallback } from 'react'
import { Box, Button, makeStyles, Typography } from '@material-ui/core'
import { FormattedMessage } from 'react-intl'

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

const CommandBox = memo(({ mutate, docId, output, setOutput }) => {
  console.log('%cRENDER_COMMAND_BOX', 'color: cyan')
  const classes = useStyles()
  const save = useCallback(async () => {
    try {
      const textArea = document.getElementById('browserDisplayArea')
      const docs = JSON.parse(textArea.value)
      await mutate(docs)
    } catch (err) {
      setOutput({ error: true, text: err.message })
    }
  }, [mutate, setOutput])
  return (
    <Box
      alignItems="center"
      className={classes.root}
      display="flex"
      px={2}
      py={1}
    >
      <Box flexGrow={1}>
        <Typography color={output.error ? 'error' : 'initial'} variant="body2">{output.text}</Typography>
      </Box>
      <Box>
        <Button color="primary" disabled={!docId} id="BrowserSaveButton" onClick={save} size="small">
          <FormattedMessage defaultMessage="Salva" description="Bottone Salva" id="reports.browser.save"/>
        </Button>
      </Box>
    </Box>
  )
})

CommandBox.displayName = 'SearchBox'

export default CommandBox
