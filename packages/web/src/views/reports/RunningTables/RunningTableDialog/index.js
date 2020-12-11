import React, { memo, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogTitle, Grid, IconButton, makeStyles, Typography } from '@material-ui/core'
import { Redirect, useHistory } from 'react-router'
import { useQuery } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import CloseIcon from '@material-ui/icons/Close'
import DetailTable from './DetailTable'
import { useGeneralStore } from 'src/zustandStore'
import shallow from 'zustand/shallow'
import { parentPath } from 'src/utils/urlFunctions'
import { messages } from 'src/translations/messages'
import { useIntl } from 'react-intl'

const useStyles = makeStyles(theme => ({
  dialogContent: {
    padding: 0,
  },
  dialogTitle: {
    padding: theme.spacing(2),
  },
  boldText: {
    fontWeight: 'bold',
  },
}))

const DialogHeader = memo(function DialogHeader ({ data, onClose }) {
  const intl = useIntl()
  const classes = useStyles()
  const { results: header } = data
  return (
    <Grid
      alignItems="center"
      container
      justify="space-between"
    >
      <Grid item>
        <Typography display="inline" variant="body2">{intl.formatMessage(messages['common_table'])}:</Typography>
        &nbsp;
        <Typography className={classes.boldText} display="inline" variant="body2">
          {header.table_display}
        </Typography>
        <br/>
        <Typography display="inline" variant="body2">{intl.formatMessage(messages['common_room'])}:</Typography>
        &nbsp;
        <Typography className={classes.boldText} display="inline" variant="body2">
          {header.room_display}
        </Typography>
      </Grid>
      <Grid item>
        <IconButton onClick={onClose}><CloseIcon/></IconButton>
      </Grid>
    </Grid>
  )
})
const loadingSel = state => ({ setLoading: state.setLoading })
const RunningTableDialog = ({ docId }) => {
  console.log('%cRENDER_DIALOG_RUNNING_DAY', 'color: orange')
  const classes = useStyles()
  const { selectedCode: { code: owner } } = useAuth()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const history = useHistory()
  const onClose = useMemo(() => {
    return () => history.push(parentPath(history.location.pathname))
  }, [history])
  
  const { isLoading, data } = useQuery([`reports/running_table/${docId}`, { owner }], {
    enabled: !!docId,
    notifyOnStatusChange: false,
    onSettled: () => {
      setLoading(false)
    },
  })
  useEffect(() => {
    if (isLoading) {
      setLoading(true)
    }
  }, [isLoading, setLoading])
  if (!isLoading && data?.ok) {
    return (
      data.results ?
        <Dialog
          aria-labelledby="runningTable-dialog-title"
          keepMounted
          maxWidth="md"
          onClose={onClose}
          open={!!docId}
        >
          <DialogTitle className={classes.dialogTitle} disableTypography id="runningTable-dialog-title">
            <DialogHeader data={data} onClose={onClose}/>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <DetailTable data={data.results}/>
          </DialogContent>
        </Dialog>
        :
        <Redirect to="/404"/>
    )
  } else {
    return null
  }
  
}

export default memo(RunningTableDialog)
