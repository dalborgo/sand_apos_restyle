import React, { useState } from 'react'
import { Box, Button, makeStyles, SvgIcon } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import Page from 'src/components/Page'
import StandardHeader from 'src/components/StandardHeader'
import IconButtonLoader from 'src/components/IconButtonLoader'
import { StandardBreadcrumb } from 'src/components/StandardBreadcrumb'
import { Filter as FilterIcon } from 'react-feather'
import RightDrawer from 'src/components/RightDrawer'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    height: '100%',
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    display: 'flex',
    overflowY: 'hidden',
    overflowX: 'auto',
  },
  innerFirst: {
    display: 'flex',
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      padding: 0,
    },
  },
}))

const ClosingDay = () => {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  
  const switchOpen = () => {
    setOpen(open => !open)
  }
  const intl = useIntl()
  return (
    <Page
      className={classes.root}
      title={intl.formatMessage(messages['menu_running_tables'])}
    >
      <Box p={3} pb={2}>
        <StandardHeader
          breadcrumb={
            <StandardBreadcrumb
              crumbs={[{ to: '/app', name: 'DashBoard' }, { name: 'Report' }]}
            />
          }
          rightComponent={
            <Box alignItems="center" display="flex">
              <Box mr={2}>
                <IconButtonLoader
                  isFetching={false}
                  onClick={() => null}
                />
              </Box>
              <Box>
                <Button color="secondary" onClick={switchOpen} variant="contained">
                  <SvgIcon fontSize="small">
                    <FilterIcon/>
                  </SvgIcon>
                  &nbsp;&nbsp;<FormattedMessage defaultMessage="Filtri" id="common.filters"/>
                </Button>
              </Box>
            </Box>
          }
        >
          <FormattedMessage defaultMessage="Tavoli in corso" id="reports.running_tables.header_title"/>
        </StandardHeader>
        <RightDrawer open={open} switchOpen={switchOpen}/>
      </Box>
      <div className={classes.content}>
        <div className={classes.innerFirst}>
          Running Tables
        </div>
      </div>
    </Page>
  )
}

export default ClosingDay
