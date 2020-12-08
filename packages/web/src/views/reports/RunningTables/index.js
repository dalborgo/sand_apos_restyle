import React from 'react'
import { Box, Button, makeStyles, SvgIcon } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import Page from 'src/components/Page'
import StandardHeader from 'src/components/StandardHeader'
import IconButtonLoader from 'src/components/IconButtonLoader'
import { StandardBreadcrumb } from 'src/components/StandardBreadcrumb'
import { Filter as FilterIcon } from 'react-feather'
import RightDrawer from 'src/components/RightDrawer'
import { useQuery } from 'react-query'
import shallow from 'zustand/shallow'
import { getEffectiveFetching } from 'src/utils/logics'
import { useSnackQueryError } from 'src/utils/reactQueryFunctions'
import useAuth from 'src/hooks/useAuth'
import useRunningTablesStore from 'src/zustandStore/useRunningTablesStore'

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

const runningSelector = state => ({
  openFilter: state.openFilter,
  switchOpenFilter: state.switchOpenFilter,
  runningRows: state.runningRows,
  setRunningRows: state.setRunningRows,
})

const RunningTables = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const intl = useIntl()
  const snackQueryError = useSnackQueryError()
  const { runningRows, setRunningRows, openFilter, switchOpenFilter } = useRunningTablesStore(runningSelector, shallow)
  const { isIdle, refetch, ...rest } = useQuery(['reports/running_tables', {
    owner,
  }], {
    onError: snackQueryError,
    onSettled: data => {
      if (data.ok) {
        setRunningRows(data.results)
      }
    },
  })
  console.log('runningRows:', runningRows)
  const effectiveFetching = getEffectiveFetching(rest)
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
                  isFetching={effectiveFetching}
                  onClick={refetch}
                />
              </Box>
              <Box>
                <Button color="secondary" onClick={switchOpenFilter} variant="contained">
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
        <RightDrawer open={openFilter} switchOpen={switchOpenFilter}/>
      </Box>
      <div className={classes.content}>
        <div className={classes.innerFirst}>
          {JSON.stringify(runningRows, null, 2)}
        </div>
      </div>
    </Page>
  )
}

export default RunningTables
