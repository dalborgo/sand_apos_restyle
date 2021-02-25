import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, makeStyles, TextField as TF } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import Page from 'src/components/Page'
import StandardHeader from 'src/components/StandardHeader'
import IconButtonLoader from 'src/components/IconButtonLoader'
import { StandardBreadcrumb } from 'src/components/StandardBreadcrumb'
import RightDrawer from 'src/components/RightDrawer'
import { useQuery, useQueryClient } from 'react-query'
import shallow from 'zustand/shallow'
import { getEffectiveFetching } from 'src/utils/logics'
import { useSnackQueryError } from 'src/utils/reactQueryFunctions'
import useAuth from 'src/hooks/useAuth'
import useRunningTablesStore from 'src/zustandStore/useRunningTablesStore'
import { FastField, Form, Formik } from 'formik'
import { TextField } from 'formik-material-ui'
import FilterButton from 'src/components/FilterButton'
import { validation } from '@adapter/common'
import LoadingLinearBoxed from 'src/components/LoadingLinearBoxed'
import DivContentWrapper from 'src/components/DivContentWrapper'
import Paper from '@material-ui/core/Paper'
import TableList from './TableList'
import { useParams } from 'react-router'
import EntriesTableDialog from 'src/components/EntriesTableDialog'

const useStyles = makeStyles(theme => ({
  paper: {
    height: '100%',
  },
  container: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: { //mobile
      padding: theme.spacing(0,2),
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
  submitFilter: state.submitFilter,
})

const FilterForm = memo(function FilterForm ({ tableFilter, roomFilter, onSubmit }) {
  const { selectedCode: { code: owner } } = useAuth()
  const intl = useIntl()
  const { isLoading, data } = useQuery(['types/rooms', { owner }], {
    notifyOnChangeProps: ['data', 'error'],
    staleTime: Infinity, // non aggiorna la cache delle stanze ogni volta che si apre la drawer (richiesto refresh)
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
                          value={room.display}
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
                <Button onClick={() => setValues(validation.resetAll(values))} size="small" variant="contained">
                  <FormattedMessage defaultMessage="Pulisci" id="common.clear"/>
                </Button>
              </Box>
              <Box>
                <Button color="secondary" disabled={!dirty} size="small" type="submit" variant="contained">
                  <FormattedMessage defaultMessage="Applica" id="common.apply"/>
                </Button>
              </Box>
            </Box>
          </Form>
        )
      }
    </Formik>
  )
})

const RunningTables = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const { docId } = useParams()
  const intl = useIntl()
  const [, setState] = useState()
  const queryClient = useQueryClient()
  const snackQueryError = useSnackQueryError()
  const {
    runningRows,
    setRunningRows,
    openFilter,
    switchOpenFilter,
    tableFilter,
    roomFilter,
    submitFilter,
  } = useRunningTablesStore(runningSelector, shallow)
  const { refetch, ...rest } = useQuery(['reports/running_tables', {
    owner,
    roomFilter,
    tableFilter,
  }], {
    onError: snackQueryError,
    onSettled: data => {// fa risparmiare un expensive rendere al primo caricamento rispetto a useEffect
      if (data?.ok) {
        setRunningRows(data.results)
      }
    },
  })
  useEffect(() => {
    async function fetchData () {
      await queryClient.prefetchQuery(['types/rooms', {
        owner,
      }], { throwOnError: true })
    }
    
    fetchData().then().catch(error => {setState(() => {throw error})})
  }, [owner, queryClient])
  useEffect(() => {
    if (rest?.data?.ok && !rest.isFetchedAfterMount) {// necessario per triggerare quando legge dalla cache
      console.log('%c***USE_EFFECT', 'color: cyan')
      setRunningRows(rest.data.results)
    }
  }, [rest.data, rest.isFetchedAfterMount, setRunningRows])
  const onFilterSubmit = useCallback(filter => {
    submitFilter(filter)
    return filter
  }, [submitFilter])
  
  const FilterFormWr = useMemo(() => (
    <FilterForm onSubmit={onFilterSubmit} roomFilter={roomFilter} tableFilter={tableFilter}/>
  ), [roomFilter, onFilterSubmit, tableFilter])
  const effectiveFetching = getEffectiveFetching(rest)
  return (
    <Page
      title={intl.formatMessage(messages['menu_running_tables'])}
    >
      <div className={classes.container}>
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
      </div>
      <DivContentWrapper>
        <Paper className={classes.paper}>
          <TableList isFetching={effectiveFetching} rows={runningRows}/>
        </Paper>
      </DivContentWrapper>
      {docId && <EntriesTableDialog docId={docId} urlKey="reports/running_table"/>}
    </Page>
  )
}

export default RunningTables
