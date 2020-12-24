import React, { memo, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogTitle, Grid, IconButton, makeStyles, Typography } from '@material-ui/core'
import { Redirect, useHistory } from 'react-router'
import { useQuery } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import CloseIcon from '@material-ui/icons/Close'
import { useGeneralStore } from 'src/zustandStore'
import shallow from 'zustand/shallow'
import { parentPath } from 'src/utils/urlFunctions'
import { FormattedMessage } from 'react-intl'

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
  divTable: {
    padding: theme.spacing(0, 1),
  },
  gridHeader: {
    paddingLeft: theme.spacing(1),
  },
}))

const ChangePaymentHeader = memo(function DialogHeader ({ data, onClose }) {
  const classes = useStyles()
  const { results: header } = data
  return (
    <Grid
      alignItems="center"
      className={classes.gridHeader}
      container
      justify="space-between"
    >
      <Grid item>
        <Typography display="inline" variant="body2">
          <FormattedMessage defaultMessage="Tipo di pagamento" id="reports.closed_tables.type_of_payment"/>:
        </Typography>
        &nbsp;
        <Typography className={classes.boldText} display="inline" variant="body2">
          {header.income}
        </Typography>
      </Grid>
      <Grid item>
        <IconButton onClick={onClose}><CloseIcon/></IconButton>
      </Grid>
    </Grid>
  )
})
const loadingSel = state => ({ setLoading: state.setLoading })
const ChangePaymentDialog = ({ docId }) => {
  console.log('%cRENDER_DIALOG_CHANGE_PAYMENT', 'color: orange')
  console.log('targetDocId:', docId)
  const classes = useStyles()
  const { selectedCode: { code: owner } } = useAuth()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const history = useHistory()
  const onClose = useMemo(() => {
    return () => history.push(parentPath(history.location.pathname, -2))
  }, [history])
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
          onClose={onClose}
          open={Boolean(true)}
        >
          <DialogTitle className={classes.dialogTitle} disableTypography id="changePaymentForm-dialog-title">
            <ChangePaymentHeader data={data} onClose={onClose}/>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <div className={classes.divTable}>
              Prova
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

export default memo(ChangePaymentDialog)
