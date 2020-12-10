import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, makeStyles, TextField as TF } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import Page from 'src/components/Page'
import StandardHeader from 'src/components/StandardHeader'
import IconButtonLoader from 'src/components/IconButtonLoader'
import { StandardBreadcrumb } from 'src/components/StandardBreadcrumb'
import RightDrawer from 'src/components/RightDrawer'
import { useQuery, useQueryCache } from 'react-query'
import shallow from 'zustand/shallow'
import { getEffectiveFetching } from 'src/utils/logics'
import { useSnackQueryError } from 'src/utils/reactQueryFunctions'
import useAuth from 'src/hooks/useAuth'
import useRunningTablesStore from 'src/zustandStore/useRunningTablesStore'
import { FastField, Form, Formik } from 'formik'
import { TextField } from 'formik-material-ui'
import FilterButton from 'src/components/FilterButton'
import { cFunctions } from '@adapter/common'
import LoadingLinearBoxed from 'src/components/LoadingLinearBoxed'

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    height: '100%',
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  paper: {
    height: '100%',
    marginTop: theme.spacing(3),
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
  tableFilter: state.filter.table,
  roomFilter: state.filter.room,
  setFilter: state.setFilter,
})

const FilterForm = function FilterForm ({ tableFilter, roomFilter, onSubmit }) {
  console.log('%cRENDER_FORM', 'color: pink')
  const { selectedCode: { code: owner } } = useAuth()
  const intl = useIntl()
  const { isLoading, data } = useQuery(['types/rooms', { owner }], {
    notifyOnStatusChange: false,
    staleTime: Infinity, //non aggiorna la cache delle stanze ogni volta che si apre la drawer (richiesto refresh)
  })
  return (
    <Formik
      initialValues={{ room: roomFilter, table: tableFilter }}
      onSubmit={onSubmit}
    >
      {
        ({ handleChange, dirty, setValues, values }) => (
          <Form>
            <Box mb={3}>
              <FastField
                component={TextField}
                fullWidth
                label={intl.formatMessage(messages['common_table'])}
                name="table"
                onFocus={event => event.target.select()}
                size="small"
                variant="outlined"
              />
            </Box>
            <Box mb={3}>
              {
                isLoading ?
                  <LoadingLinearBoxed boxHeight={40}/>
                  :
                  data?.ok &&
                  <FastField
                    as={TF}
                    fullWidth
                    label={intl.formatMessage(messages['common_room'])}
                    name="room"
                    onChange={
                      event => {
                        handleChange(event)
                      }
                    }
                    select
                    SelectProps={{ native: true }}
                    size="small"
                    variant="outlined"
                  >
                    <option
                      value={''}
                    >
                      {''}
                    </option>
                    {
                      data.results.map(room => (
                        <option
                          key={room._id}
                          value={room._id}
                        >
                          {room.display}
                        </option>
                      ))
                    }
                  </FastField>
              }
            </Box>
            <Box display="flex" justifyContent="flex-end">
              <Box mr={2}>
                <Button onClick={() => setValues(cFunctions.resetAll(values))} size="small" variant="contained">
                  <FormattedMessage defaultMessage="Pulisci" id="filter_from.clear"/>
                </Button>
              </Box>
              <Box>
                <Button color="secondary" disabled={!dirty} size="small" type="submit" variant="contained">
                  <FormattedMessage defaultMessage="Applica" id="filter_from.apply"/>
                </Button>
              </Box>
            </Box>
          </Form>
        )
      }
    </Formik>
  )
}

const RunningTables = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const intl = useIntl()
  // eslint-disable-next-line no-unused-vars
  const [_, setState] = useState()
  const queryCache = useQueryCache()
  const snackQueryError = useSnackQueryError()
  const {
    runningRows,
    setRunningRows,
    openFilter,
    switchOpenFilter,
    tableFilter,
    roomFilter,
    setFilter,
  } = useRunningTablesStore(runningSelector, shallow)
  const { isIdle, refetch, ...rest } = useQuery(['reports/running_tables', {
    owner,
  }], {
    onError: snackQueryError,
    onSettled: data => {
      if (data?.ok) {
        setRunningRows(data.results)
      }
    },
  })
  useEffect(() => {
    async function fetchData () {
      await queryCache.prefetchQuery(['types/rooms', {
        owner,
      }], { throwOnError: true })
    }
  
    fetchData().then().catch(error => {setState(() => {throw error})})
  }, [owner, queryCache])
  console.log('runningRows:', runningRows)
  const onFilterSubmit = useCallback(filter => {
    console.log('filter:', filter)
    setFilter(filter)
    switchOpenFilter()
    return filter
  }, [setFilter, switchOpenFilter])
  
  const DivWrapper = ({ children }) => {
    const classes = useStyles()
    return (
      <div className={classes.content}>
        <div className={classes.innerFirst}>
          {children}
        </div>
      </div>
    )
  }
  
  const FilterFormWr = useMemo(() => (
    <FilterForm onSubmit={onFilterSubmit} roomFilter={roomFilter} tableFilter={tableFilter}/>
  ), [roomFilter, onFilterSubmit, tableFilter])
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
                <FilterButton
                  isActive={roomFilter || tableFilter}
                  onClick={switchOpenFilter}
                />
              </Box>
            </Box>
          }
        >
          <FormattedMessage defaultMessage="Tavoli in corso" id="reports.running_tables.header_title"/>
        </StandardHeader>
        <RightDrawer open={openFilter} switchOpen={switchOpenFilter}>
          {FilterFormWr}
        </RightDrawer>
      </Box>
      <DivWrapper>
        {JSON.stringify(runningRows, null, 2)}
      </DivWrapper>
    </Page>
  )
}

export default RunningTables
