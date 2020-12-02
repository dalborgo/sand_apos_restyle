import React, { memo } from 'react'
import { Dialog, DialogContent, DialogTitle, Grid, makeStyles, withWidth } from '@material-ui/core'
import { useHistory } from 'react-router'
import { useQuery } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import LoadingCircularBoxed from 'src/components/LoadingCircularBoxed'
import clsx from 'clsx'
import ClosingTable from './ClosingTable'

const useStyles = makeStyles(() => ({
  dialogContent: {
    minHeight: 600,
    minWidth: 500,
  },
}))

const ClosingDayDialog = ({ width, docId }) => {
  console.log('%cRENDER_DIALOG_CLOSING_DAY', 'color: orange')
  const { selectedCode: { code: owner } } = useAuth()
  const fullScreen = ['sm', 'xs'].includes(width)
  const history = useHistory()
  const classes = useStyles()
  const { isLoading, data, isSuccess } = useQuery(['queries/query_by_id', { id: docId, owner }], { enabled: docId })
  return (
    <Dialog
      aria-labelledby="closingDay-dialog-title"
      fullScreen={fullScreen}
      keepMounted
      onClose={history.goBack}
      open={!!docId}
    >
      <DialogTitle id="closingDay-dialog-title">
        <Grid
          container
          justify="space-between"
        >
          <Grid item>
            Apertura:
          </Grid>
          <Grid item>
            Chiusura:
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent className={clsx({ [classes.dialogContent]: !fullScreen })}>
        {
          isLoading ?
            <LoadingCircularBoxed/>
            :
            isSuccess && <ClosingTable data={data}/>
        }
      </DialogContent>
    </Dialog>
  )
}

export default memo(withWidth()(ClosingDayDialog))
