import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  makeStyles,
  Typography,
  withWidth
} from '@material-ui/core'
import { Redirect, useHistory } from 'react-router'
import { useQuery } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import CloseIcon from '@material-ui/icons/Close'
import { useGeneralStore } from 'src/zustandStore'
import shallow from 'zustand/shallow'
import { parentPath } from 'src/utils/urlFunctions'
import { FormattedMessage } from 'react-intl'
import { ChangePaymentForm } from './comps'
import { useLocation } from 'react-router-dom'

const useStyles = makeStyles(theme => ({
  dialogContent: {
    padding: 0,
  },
  dialogTitle: {
    padding: theme.spacing(1),
  },
  boldText: {
    fontWeight: 'bold',
  },
  divTable: {
    padding: theme.spacing(0, 1),
  },
  gridHeader: {
    paddingLeft: theme.spacing(1),
  },
}))

const ChangePaymentHeader = memo(function DialogHeader ({ onClose }) {
  const classes = useStyles()
  return (
    <Grid
      alignItems="center"
      className={classes.gridHeader}
      container
      justify="space-between"
    >
      <Grid item>
        <Typography style={{fontVariant: 'small-caps'}} variant="h4">
          <FormattedMessage defaultMessage="Seleziona il Tipo di Pagamento" id="reports.closed_tables.select_type_of_payment"/>&nbsp;
        </Typography>
      </Grid>
      <Grid item>
        <IconButton onClick={onClose}><CloseIcon/></IconButton>
      </Grid>
    </Grid>
  )
})
const loadingSel = state => ({ setLoading: state.setLoading })
const ChangePaymentDialog = ({ docId, width }) => {
  console.log('%cRENDER_DIALOG_CHANGE_PAYMENT', 'color: orange')
  const classes = useStyles()
  const location = useLocation()
  const [income] = useState(location.income)
  const { selectedCode: { code: owner } } = useAuth()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const history = useHistory()
  const fullScreen = ['sm', 'xs'].includes(width)
  const closeChangePaymentDialog = useMemo(() => {
    return () => history.push(parentPath(history.location.pathname, -2))
  }, [history])
  const changePaymentSubmit = useCallback(values => {
    console.log('targetDocId:', docId)
    console.log('values:', values)
    closeChangePaymentDialog()
    return values
  }, [closeChangePaymentDialog, docId])
  const { isLoading, data } = useQuery(['types/incomes', { owner }], {
    notifyOnChangeProps: ['data', 'error'],
    staleTime: 5000, //non chiama due volte il server per richieste ravvicinate
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
          aria-labelledby="runningTable-dialog-title"
          maxWidth="md"
          fullScreen={fullScreen}
          onClose={closeChangePaymentDialog}
          open={Boolean(true)}
        >
          <DialogTitle className={classes.dialogTitle} disableTypography id="changePaymentForm-dialog-title">
            <ChangePaymentHeader income={income} onClose={closeChangePaymentDialog}/>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <div className={classes.divTable}>
              <ChangePaymentForm income={income} onSubmit={changePaymentSubmit}/>
            </div>
          </DialogContent>
        </Dialog>
        :
        <Redirect to="/404"/>
    )
  } else {
    return null
  }
  
}

export default memo(withWidth()(ChangePaymentDialog))
