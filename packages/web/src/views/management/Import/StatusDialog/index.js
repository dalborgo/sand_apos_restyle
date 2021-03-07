import React, { memo, useMemo } from 'react'
import { Dialog, DialogTitle, Grid, IconButton, makeStyles, Typography, withWidth } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { FormattedMessage } from 'react-intl'

import { StatusReport } from './comps'
import { useLocation } from 'react-router-dom'

const useStyles = makeStyles(theme => ({
  typoError: {
    color: theme.palette.error.dark,
  },
  dialogTitle: {
    padding: theme.spacing(1, 1, 0.3, 1.5),
  },
  iconClose: {
    padding: theme.spacing(1),
  },
  boldText: {
    fontWeight: 'bold',
  },
  headerIcon: {
    height: 28,
  },
}))

function getIconName (statusId, data) {
  if (statusId === 'status_ok') {
    const { stats } = data
    return stats.notSaved.length ? 'warn' : 'ok'
  } else {
    return 'error'
  }
}

const NotificationHeader = memo(function DialogHeader ({ onClose, statusId, data }) {
  const classes = useStyles()
  const icon = getIconName(statusId, data)
  return (
    <Grid
      alignItems="center"
      className={classes.gridHeader}
      container
      justify="space-between"
    >
      <Grid item>
        <img
          alt={icon}
          className={classes.headerIcon}
          src={`/static/images/${icon}.svg`}
        />
      </Grid>
      <Grid item>
        {
          statusId === 'status_ok' ?
            <Typography display="inline" variant="h4">
              <FormattedMessage
                defaultMessage="Risultato importazione"
                id="management.import.status_ok"
              />
            </Typography>
            :
            <Typography className={classes.typoError} display="inline" variant="h4">
              <FormattedMessage
                defaultMessage="Errore nel file d'importazione"
                id="management.import.status_ko"
              />
            </Typography>
        }
      </Grid>
      <Grid item>
        <IconButton className={classes.iconClose} onClick={onClose}><CloseIcon/></IconButton>
      </Grid>
    </Grid>
  )
})

const StatusDialog = ({ width, close, statusId }) => {
  const classes = useStyles()
  const fullScreen = useMemo(() => ['sm', 'xs'].includes(width), [width])
  const { state = {} } = useLocation()
  if (state.data) {
    return (
      <Dialog
        aria-labelledby="notification-dialog-title"
        fullScreen={fullScreen}
        maxWidth="md"
        onClose={close}
        open={Boolean(true)}
      >
        <DialogTitle className={classes.dialogTitle} disableTypography id="notificationForm-dialog-title">
          <NotificationHeader data={state.data} onClose={close} statusId={statusId}/>
        </DialogTitle>
        <StatusReport data={state.data} statusId={statusId}/>
      </Dialog>
    )
  } else {
    return null
  }
  
}

export default memo(withWidth()(StatusDialog))
