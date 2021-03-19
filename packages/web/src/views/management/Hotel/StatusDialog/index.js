import React, { memo, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  Grid,
  IconButton,
  isWidthDown,
  makeStyles,
  Typography,
  withWidth,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { FormattedMessage } from 'react-intl'
import { StatusReport } from './comps'
import { Redirect, useHistory, useLocation } from 'react-router-dom'
import { parentPath } from 'src/utils/urlFunctions'

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

const NotificationHeader = memo(function DialogHeader ({ onClose }) {
  const classes = useStyles()
  return (
    <Grid
      alignItems="center"
      className={classes.gridHeader}
      container
      justify="space-between"
    >
      <Grid item xs={3}/>
      <Grid item>
        <Typography display="inline" variant="h4">
          <FormattedMessage
            defaultMessage="Risultato allineamento"
            id="management.hotel.align_result"
          />
        </Typography>
      </Grid>
      <Grid item style={{ textAlign: 'right' }} xs={3}>
        <IconButton className={classes.iconClose} onClick={onClose}><CloseIcon/></IconButton>
      </Grid>
    </Grid>
  )
})

const StatusDialog = ({ width, refetchOnClick }) => {
  const classes = useStyles()
  const fullScreen = useMemo(() => isWidthDown('sm', width), [width])
  const history = useHistory()
  const close = useCallback(() => {
    refetchOnClick().then()
    history.push(parentPath(history.location.pathname, -1))
  }, [history, refetchOnClick])
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
          <NotificationHeader onClose={close}/>
        </DialogTitle>
        <StatusReport data={state.data}/>
      </Dialog>
    )
  } else {
    return <Redirect to="/app/management"/>
  }
}

export default memo(withWidth()(StatusDialog))
