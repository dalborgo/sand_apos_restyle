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
import { Redirect, useHistory } from 'react-router'
import { useQuery } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import CloseIcon from '@material-ui/icons/Close'
import ClosingTable from './ClosingTable'
import { useDateTimeFormatter } from 'src/utils/formatters'
import { useGeneralStore } from 'src/zustandStore'
import shallow from 'zustand/shallow'
import { parentPath } from 'src/utils/urlFunctions'
import { FormattedMessage } from 'react-intl'

const useStyles = makeStyles(() => ({
  dialogContent: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  dialogTitle: {
    paddingBottom: 0,
  },
  boldText: {
    fontWeight: 'bold',
  },
}))

const DialogHeader = memo(function DialogHeader ({ data, onClose }) {
  const dateTimeFormatter = useDateTimeFormatter()
  const classes = useStyles()
  const { results: header } = data
  return (
    <Grid
      alignItems="center"
      container
      justify="space-between"
    >
      <Grid item>
        <Typography display="inline" variant="body2">
          <FormattedMessage
            defaultMessage="Chiusura"
            id="reports.closing_day.closing"
          />:
        </Typography>
        &nbsp;
        <Typography className={classes.boldText} display="inline" variant="body2">
          {dateTimeFormatter(header.close_date, { year: undefined, month: '2-digit' }, {second: undefined})}
        </Typography>
        <br/>
        <Typography display="inline" variant="body2">
          <FormattedMessage
            defaultMessage="Apertura"
            id="reports.closing_day.opening"
          />:
        </Typography>
        &nbsp;
        <Typography className={classes.boldText} display="inline" variant="body2">
          {dateTimeFormatter(header.date, { year: undefined, month: '2-digit' }, {second: undefined})}
        </Typography>
      </Grid>
      <Grid item>
        <IconButton onClick={onClose}><CloseIcon/></IconButton>
      </Grid>
    </Grid>
  )
})
const loadingSel = state => ({ setLoading: state.setLoading })
const ClosingDayDialog = ({ width, docId }) => {
  console.log('%cRENDER_DIALOG_CLOSING_DAY', 'color: orange')
  const classes = useStyles()
  const { selectedCode: { code: owner } } = useAuth()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const fullScreen = useMemo(()=>['sm', 'xs'].includes(width),[width])
  const history = useHistory()
  const onClose = useMemo(() => {
    return () => history.push(parentPath(history.location.pathname))
  }, [history])
  
  const { isLoading, data } = useQuery(['queries/query_by_id', { id: docId, owner }], {
    notifyOnChangeProps: ['data', 'error'],
    staleTime: 5000,
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
          aria-labelledby="closingDay-dialog-title"
          fullScreen={fullScreen}
          keepMounted
          onClose={onClose}
          open={Boolean(true)}
        >
          <DialogTitle className={classes.dialogTitle} disableTypography id="closingDay-dialog-title">
            <DialogHeader data={data} onClose={onClose}/>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <ClosingTable data={data}/>
          </DialogContent>
        </Dialog>
        :
        <Redirect to="/404"/>
    )
  } else {
    return null
  }
  
}

export default memo(withWidth()(ClosingDayDialog))
