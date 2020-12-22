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
import useClosedTablesStore from 'src/zustandStore/useClosedTablesStore'
import { FastField, Form, Formik } from 'formik'
import { TextField } from 'formik-material-ui'
import FilterButton from 'src/components/FilterButton'
import { validation } from '@adapter/common'
import LoadingLinearBoxed from 'src/components/LoadingLinearBoxed'
import DivContentWrapper from 'src/components/DivContentWrapper'
import Paper from '@material-ui/core/Paper'
import TableList from './TableList'
import ClosedTableDialog from './ClosedTableDialog'
import { useParams } from 'react-router'

const useStyles = makeStyles(() => ({
  paper: {
    height: '100%',
  },
}))

const closingSelector = state => ({
  openFilter: state.openFilter,
  switchOpenFilter: state.switchOpenFilter,
  closingRows: state.closingRows,
  setClosedRows: state.setClosedRows,
  tableFilter: state.filter.table,
  roomFilter: state.filter.room,
  submitFilter: state.submitFilter,
})

const FilterForm = memo(function FilterForm ({ tableFilter, roomFilter, onSubmit }) {
  console.log('%cRENDER_FORM', 'color: pink')
  const { selectedCode: { code: owner } } = useAuth()
  const intl = useIntl()
  const { isLoading, data } = useQuery(['types/rooms', { owner }], {
    notifyOnChangeProps: ['data', 'error'],
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
                <Button onClick={() => setValues(validation.resetAll(values))} size="small" variant="contained">
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
})

const ClosedTables = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const { docId } = useParams()
  const intl = useIntl()
  const [, setState] = useState()
  const queryClient = useQueryClient()
  const snackQueryError = useSnackQueryError()
  const {
    closingRows,
    setClosedRows,
    openFilter,
    switchOpenFilter,
    tableFilter,
    roomFilter,
    submitFilter,
  } = useClosedTablesStore(closingSelector, shallow)
  const { refetch, ...rest } = useQuery(['reports/closing_tables', {
    owner,
    roomFilter,
    tableFilter,
  }], {
    onError: snackQueryError,
    onSettled: data => { //fa risparmiare un expensive rendere al primo caricamento rispetto a sueEffect
      if (data?.ok) {
        setClosedRows(data.results)
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
    if (rest?.data?.ok && !rest.isFetchedAfterMount) { //necessario per triggerare quando legge dalla cache
      console.log('%c***USE_EFFECT', 'color: cyan')
      setClosedRows(rest.data.results)
    }
  }, [rest.data, rest.isFetchedAfterMount, setClosedRows])
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
      title={intl.formatMessage(messages['menu_closing_tables'])}
    >
      <Box p={2}>
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
          <FormattedMessage defaultMessage="Tavoli chiusi" id="reports.closing_tables.header_title"/>
        </StandardHeader>
        <RightDrawer open={openFilter} switchOpen={switchOpenFilter}>
          {FilterFormWr}
        </RightDrawer>
      </Box>
      <DivContentWrapper>
        <Paper className={classes.paper}>
          <TableList isFetching={effectiveFetching} rows={closingRows}/>
        </Paper>
      </DivContentWrapper>
      {docId && <ClosedTableDialog docId={docId}/>}
    </Page>
  )
}

export default ClosedTables
