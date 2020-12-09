import React, { memo } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Box, Drawer, IconButton, makeStyles, Typography } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { FormattedMessage } from 'react-intl'

const useStyles = makeStyles(() => ({
  drawer: {
    width: 500,
    maxWidth: '100%',
  },
}))

const RightDrawer = memo(function RightDrawer ({ open, switchOpen, children, title }) {
  console.log('%cRENDER_Drawer', 'color: yellow')
  const classes = useStyles()
  return (
    <Drawer
      anchor="right"
      classes={{ paper: classes.drawer }}
      ModalProps={{ BackdropProps: { invisible: true } }}
      onClose={switchOpen}
      open={open}
      variant="temporary"
    >
      <PerfectScrollbar options={{ suppressScrollX: true }}>
        <Box p={3}>
          <Box
            alignItems="center"
            display="flex"
            justifyContent="space-between"
          >
            <Typography
              color="textPrimary"
              variant="h4"
            >
              {title}
            </Typography>
            <IconButton onClick={switchOpen}>
              <CloseIcon/>
            </IconButton>
          </Box>
          <Box mt={2}>
            {children}
          </Box>
        </Box>
      </PerfectScrollbar>
    </Drawer>
  )
})

RightDrawer.defaultProps = {
  title: <FormattedMessage defaultMessage="Filtri" id="common.filters"/>,
}

export default RightDrawer
