import React, { memo } from 'react'
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  withWidth,
} from '@material-ui/core'
import { useHistory } from 'react-router'
import { useQuery } from 'react-query'
import useAuth from 'src/hooks/useAuth'

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide ref={ref} {...props} />
})
const ClosingDayDialog = ({ open, width }) => {
  console.log('%cRENDER_DIALOG_CLOSING_DAY', 'color: orange')
  const { selectedCode: { code: owner } } = useAuth()
  const fullScreen = ['sm', 'xs'].includes(width)
  const history = useHistory()
  const { isLoading, data = {} } = useQuery(['queries/query_by_type', {
    type: 'USER',
    owner,
  }])
  
  return (
    <Dialog
      aria-labelledby="closingDay-dialog-title"
      fullScreen={fullScreen}
      keepMounted
      onClose={history.goBack}
      open={open}
      TransitionComponent={Transition}
    >
      <DialogTitle id="closingDay-dialog-title">Titolo</DialogTitle>
      <DialogContent>
        {
          isLoading ?
            <Box><CircularProgress/></Box>
            :
            <DialogContentText>
              {JSON.stringify(data, null, 2)}
            </DialogContentText>
        }
      </DialogContent>
    </Dialog>
  )
}
export default memo(withWidth()(ClosingDayDialog))
