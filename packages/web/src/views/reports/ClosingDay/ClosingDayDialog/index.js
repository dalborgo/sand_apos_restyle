import React, { memo, useMemo } from 'react'
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
import clsx from 'clsx'
import ClosingTable from './ClosingTable'
import { useDateFormatter } from 'src/utils/formatters'
import LoadingCircularBoxed from 'src/components/LoadingCircularBoxed'

const useStyles = makeStyles(() => ({
  dialogContent: {
    minHeight: 600,
    minWidth: 500,
  },
  boldText: {
    fontWeight: 'bold',
  },
}))

const DialogHeader = memo(function DialogHeader ({ data, onClose }) {
  const dateFormatter = useDateFormatter()
  const classes = useStyles()
  const { results: header } = data
  return (
    <Grid
      alignItems="center"
      container
      justify="space-between"
    >
      <Grid item>
        <Typography display="inline" variant="body2">Apertura:</Typography>
        &nbsp;
        <Typography className={classes.boldText} display="inline" variant="body2">
          {dateFormatter(header.date, { month: 'short' })}
        </Typography>
        <br/>
        <Typography display="inline" variant="body2">Chiusura:</Typography>
        &nbsp;
        <Typography className={classes.boldText} display="inline" variant="body2">
          {dateFormatter(header.date, { month: 'short' })}
        </Typography>
      </Grid>
      <Grid item>
        <IconButton onClick={onClose}><CloseIcon/></IconButton>
      </Grid>
    </Grid>
  )
})

const ClosingDayDialog = ({ width, docId }) => {
  console.log('%cRENDER_DIALOG_CLOSING_DAY', 'color: orange')
  const { selectedCode: { code: owner } } = useAuth()
  const fullScreen = ['sm', 'xs'].includes(width)
  const history = useHistory()
  const onClose = useMemo(() => {
    const baseUrl = window.location.pathname.replace(`/${docId}`, '')
    return () => history.push(baseUrl)
  }, [docId, history])
  const classes = useStyles()
  const { isLoading, data } = useQuery(['queries/query_by_id', { id: docId, owner }], { enabled: docId })
  if (docId) {
    return (
      <Dialog
        aria-labelledby="closingDay-dialog-title"
        fullScreen={fullScreen}
        keepMounted
        onClose={onClose}
        open={!!docId}
      >
        {
          !isLoading ?
            data.results ?
              <>
                <DialogTitle disableTypography id="closingDay-dialog-title">
                  <DialogHeader data={data} onClose={onClose}/>
                </DialogTitle>
                <DialogContent>
                  <ClosingTable data={data}/>
                </DialogContent>
              </>
              :
              <Redirect to="/404"/>
            :
            <DialogContent className={clsx({ [classes.dialogContent]: !fullScreen })}>
              <LoadingCircularBoxed/>
            </DialogContent>
        }
      </Dialog>
    )
  } else {
    return null
  }
  
}

export default memo(withWidth()(ClosingDayDialog))
