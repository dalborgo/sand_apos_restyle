import React, { memo, useEffect, useMemo } from 'react'
import { colors, Dialog, DialogTitle, Grid, IconButton, makeStyles, Typography, withWidth } from '@material-ui/core'
import { Redirect } from 'react-router'
import { useQuery } from 'react-query'
import CloseIcon from '@material-ui/icons/Close'
import { useGeneralStore } from 'src/zustandStore'
import shallow from 'zustand/shallow'
import { FormattedMessage, useIntl } from 'react-intl'

import { StatusReport } from './comps'
import { getStatusLabel } from '../helpers'

const useStyles = makeStyles(theme => ({
  typoError: {
    color: theme.palette.error.main,
  },
  typoCyan: {
    color: colors.cyan[400],
  },
  typoGreen: {
    color: colors.green[500],
  },
  dialogContent: {
    padding: 0,
  },
  dialogAction: {
    padding: theme.spacing(1, 2),
  },
  dialogTitle: {
    padding: theme.spacing(0.5, 1, 0.5, 2),
  },
  boldText: {
    fontWeight: 'bold',
  },
  gridHeader: {
    paddingLeft: theme.spacing(1),
  },
}))

const getTextColor = (status, classes) => {
  switch (status) {
    case 999:
    case 777:
      return classes.typoError
    case 3:
    case 2:
      return classes.typoCyan
    case 1:
    case 0:
      return classes.typoGreen
    default:
      return classes.typoError
  }
}

const NotificationHeader = memo(function DialogHeader ({ onClose, statusCode }) {
  const classes = useStyles()
  const intl = useIntl()
  return (
    <Grid
      alignItems="center"
      className={classes.gridHeader}
      container
      justify="space-between"
    >
      <Grid item>
        <Typography display="inline" variant="h4">
          <FormattedMessage
            defaultMessage="Info fattura: "
            id="reports.e_invoices.notification"
          />&nbsp;
        </Typography>
        <Typography className={getTextColor(statusCode, classes)} display="inline" variant="h4">
          {getStatusLabel(statusCode, intl).toLowerCase()}
        </Typography>
      </Grid>
      <Grid item style={{ marginLeft: 15 }}>
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
    const { results } = data
    return (
      results ?
        <Dialog
          aria-labelledby="notification-dialog-title"
          fullScreen={fullScreen}
          maxWidth="md"
          onClose={close}
          open={Boolean(true)}
        >
          <DialogTitle className={classes.dialogTitle} disableTypography id="notificationForm-dialog-title">
            <NotificationHeader onClose={close} statusCode={results.status.status_code}/>
          </DialogTitle>
          <StatusReport data={results} docId={docId} onClose={close}/>
        </Dialog>
        :
        <Redirect to="/404"/>
    )
  } else {
    return null
  }
  
}

export default memo(withWidth()(NotificationDialog))
