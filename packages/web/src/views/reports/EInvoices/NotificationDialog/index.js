import React, { memo, useEffect, useMemo } from 'react'
import { Dialog, DialogTitle, Grid, IconButton, makeStyles, Typography, withWidth, } from '@material-ui/core'
import { Redirect } from 'react-router'
import { useQuery } from 'react-query'
import CloseIcon from '@material-ui/icons/Close'
import { useGeneralStore } from 'src/zustandStore'
import shallow from 'zustand/shallow'
import { FormattedMessage } from 'react-intl'

import { StatusReport } from './comps'

const useStyles = makeStyles(theme => ({
  dialogContent: {
    padding: 0,
  },
  dialogAction: {
    padding: theme.spacing(1, 2),
  },
  dialogTitle: {
    padding: theme.spacing(1, 1, 1, 2),
  },
  boldText: {
    fontWeight: 'bold',
  },
  gridHeader: {
    paddingLeft: theme.spacing(1),
  },
}))

const NotificationHeader = memo(function DialogHeader ({ onClose }) {
  const classes = useStyles()
  return (
    <Grid
      alignItems="center"
      className={classes.gridHeader}
      container
      justify="space-between"
    >
      <Grid item>
        <Typography style={{ fontVariant: 'small-caps' }} variant="h4">
          <FormattedMessage
            defaultMessage="Info fattura"
            id="reports.e_invoices.notification"
          />&nbsp;
        </Typography>
      </Grid>
      <Grid item>
        <IconButton onClick={onClose}><CloseIcon/></IconButton>
      </Grid>
    </Grid>
  )
})

const loadingSel = state => ({ setLoading: state.setLoading })
const NotificationDialog = ({ width, close, docId }) => {
  const classes = useStyles()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const fullScreen = useMemo(() => ['sm', 'xs'].includes(width), [width])
  const { isLoading, data } = useQuery(['queries/query_by_id', { id: docId, columns: ['fatt_elett'] }], {
    notifyOnChangeProps: ['data', 'error'],
    staleTime: Infinity,// non chiama due volte il server per richieste ravvicinate
    onSettled: () => {
      isLoading && setLoading(false)
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
          aria-labelledby="notification-dialog-title"
          fullScreen={fullScreen}
          maxWidth="md"
          onClose={close}
          open={Boolean(true)}
        >
          <DialogTitle className={classes.dialogTitle} disableTypography id="notificationForm-dialog-title">
            <NotificationHeader onClose={close}/>
          </DialogTitle>
          <StatusReport data={data} docId={docId} onClose={close}/>
        </Dialog>
        :
        <Redirect to="/404"/>
    )
  } else {
    return null
  }
  
}

export default memo(withWidth()(NotificationDialog))
