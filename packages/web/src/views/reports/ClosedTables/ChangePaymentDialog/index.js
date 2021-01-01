import React, { memo, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  makeStyles,
  Typography,
  withWidth,
} from '@material-ui/core'
import { Redirect } from 'react-router'
import { useQuery } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import CloseIcon from '@material-ui/icons/Close'
import { useGeneralStore } from 'src/zustandStore'
import shallow from 'zustand/shallow'
import { FormattedMessage } from 'react-intl'
import { ChangePaymentForm } from './comps'

const useStyles = makeStyles(theme => ({
  dialogContent: {
    padding: 0,
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
        <Typography style={{ fontVariant: 'small-caps' }} variant="h4">
          <FormattedMessage
            defaultMessage="Seleziona il Tipo di Pagamento"
            id="reports.closed_tables.select_type_of_payment"
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
const ChangePaymentDialog = ({ width, onSubmit, close }) => {
  console.log('%cRENDER_DIALOG_CHANGE_PAYMENT', 'color: orange')
  const classes = useStyles()
  const { selectedCode: { code: owner } } = useAuth()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const fullScreen = useMemo(() => ['sm', 'xs'].includes(width), [width])
  const { isLoading, data } = useQuery(['types/incomes', { owner }], {
    notifyOnChangeProps: ['data', 'error'],
    staleTime: Infinity, //non chiama due volte il server per richieste ravvicinate
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
          fullScreen={fullScreen}
          maxWidth="md"
          onClose={close}
          open={Boolean(true)}
        >
          <DialogTitle className={classes.dialogTitle} disableTypography id="changePaymentForm-dialog-title">
            <ChangePaymentHeader onClose={close}/>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <ChangePaymentForm data={data} isLoading={isLoading} onSubmit={onSubmit}/>
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
