import React, { memo, useCallback } from 'react'
import { Box, Button, Typography } from '@material-ui/core'
import { FormattedMessage } from 'react-intl'

const CommandBox = memo(({ mutate, isDocId, output, setOutput }) => {
  console.log('%cRENDER_COMMAND_BOX', 'color: cyan')
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
      display="flex"
      px={2}
      py={1}
    >
      <Box flexGrow={1}>
        <Typography color={output.error ? 'error' : 'initial'} variant="body2">{output.text}</Typography>
      </Box>
      <Box>
        <Button color="primary" disabled={!isDocId} id="BrowserSaveButton" onClick={save} size="small">
          <FormattedMessage defaultMessage="Salva" description="Bottone Salva" id="reports.browser.save"/>
        </Button>
      </Box>
    </Box>
  )
})

CommandBox.displayName = 'SearchBox'

export default CommandBox
