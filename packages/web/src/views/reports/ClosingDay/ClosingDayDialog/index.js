import React, { memo } from 'react'
import { Dialog, DialogContent, DialogContentText, DialogTitle, makeStyles, withWidth, } from '@material-ui/core'
import { useHistory } from 'react-router'
import { useQuery } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import LoadingCircularBoxed from 'src/components/LoadingCircularBoxed'
import clsx from 'clsx'

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
  const { isLoading, data = {} } = useQuery(['queries/query_by_id', { id: docId, owner }])
  return (
    <Dialog
      aria-labelledby="closingDay-dialog-title"
      fullScreen={fullScreen}
      keepMounted
      onClose={history.goBack}
      open={!!docId}
    >
      <DialogTitle id="closingDay-dialog-title">Titolo</DialogTitle>
      <DialogContent className={clsx({ [classes.dialogContent]: !fullScreen })}>
        {
          isLoading ?
            <LoadingCircularBoxed/>
            :
            <DialogContentText>
              {JSON.stringify(data, null, 2)}
            </DialogContentText>
        }
      </DialogContent>
    </Dialog>
  )
}

function moviePropsAreEqual (prevMovie, nextMovie) {
  return prevMovie.docId === nextMovie.docId
}

export default memo(withWidth()(ClosingDayDialog), moviePropsAreEqual)
