import React, { memo, useCallback } from 'react'
import { Box, Button, Typography } from '@material-ui/core'
import { FormattedMessage } from 'react-intl'
import { useSnackbar } from 'notistack';

const CommandBox = memo(function CommandBox ({ mutate, isDocId, output }) {
  const { enqueueSnackbar } = useSnackbar()
  const save = useCallback(async () => {
    try {
      const textArea = document.getElementById('browserDisplayArea')
      const docs = JSON.parse(textArea.value)
      await mutate(docs)
    } catch (err) {
      enqueueSnackbar(err.message)
    }
  }, [enqueueSnackbar, mutate])
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

export default CommandBox
