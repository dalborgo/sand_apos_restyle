import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, makeStyles, TextField as TF } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import Page from 'src/components/Page'
import StandardHeader from 'src/components/StandardHeader'
import IconButtonLoader from 'src/components/IconButtonLoader'
import { StandardBreadcrumb } from 'src/components/StandardBreadcrumb'
import RightDrawer from 'src/components/RightDrawer'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import shallow from 'zustand/shallow'
import { getEffectiveFetching } from 'src/utils/logics'
import { axiosLocalInstance, useSnackQueryError } from 'src/utils/reactQueryFunctions'
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
import { useHistory, useParams } from 'react-router'
import moment from 'moment'
import DateRangeFormikWrapper from 'src/components/DateRangeFormikWrapper'
import ChangePaymentDialog from './ChangePaymentDialog'
import EntriesTableDialog from 'src/components/EntriesTableDialog'
import find from 'lodash/find'
import cloneDeep from 'lodash/cloneDeep'
import { parentPath } from 'src/utils/urlFunctions'
import { useSnackbar } from 'notistack'

const useStyles = makeStyles(theme => ({
  paper: {
    [theme.breakpoints.up('md')]: { //mobile
      height: '100%',
    },
  },
  container: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: { //mobile
      padding: theme.spacing(0, 2),
    },
  },
}))

const closedTableSelector = state => ({
  closedRows: state.closedRows,
  endDate: state.endDate,
  openFilter: state.openFilter,
  roomFilter: state.filter.room,
  setClosedRows: state.setClosedRows,
  setDateRange: state.setDateRange,
  startDate: state.startDate,
  submitFilter: state.submitFilter,
  switchOpenFilter: state.switchOpenFilter,
  tableFilter: state.filter.table,
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

const changePaymentMutation = async values => {
  const { data } = await axiosLocalInstance.put('queries/update_by_id', {
    ...values,
  })
  return data
}

function changePayment (closedRows, _id, income) {
  const newRows = cloneDeep(closedRows)
  let payment
  find(newRows, row => {
    if (Array.isArray(row.payments)) {
      payment = find(row.payments, { _id })
      return payment
    } else {
      if (row.payments._id === _id) {
        payment = row.payments
        return true
      }
    }
  })
  payment.income = income
  return newRows
}

const ClosedTables = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const { docId, targetDocId } = useParams()
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()
  const queryClient = useQueryClient()
  const intl = useIntl()
  const [, setState] = useState()
  const snackQueryError = useSnackQueryError()
  const {
    startDate,
    endDate,
    closedRows,
    setDateRange,
    setClosedRows,
    openFilter,
    switchOpenFilter,
    tableFilter,
    roomFilter,
    submitFilter,
  } = useClosedTablesStore(closedTableSelector, shallow)
  const fetchKey = useMemo(() => ['reports/closed_tables', {
    startDateInMillis: startDate ? moment(startDate).format('YYYYMMDDHHmmssSSS') : undefined,
    endDateInMillis: endDate ? moment(endDate).format('YYYYMMDDHHmmssSSS') : undefined,
    owner,
    roomFilter,
    tableFilter,
  }], [endDate, owner, roomFilter, startDate, tableFilter])
  const { refetch, isIdle, ...rest } = useQuery(fetchKey, {
    onError: snackQueryError,
    enabled: Boolean(startDate && endDate),
    onSettled: data => { //fa risparmiare un expensive rendere al primo caricamento rispetto a useEffect
      if (data?.ok) {
        setClosedRows(data.results)
      }
    },
  })
  
  const mutation = useMutation(changePaymentMutation, {
    onSettled: data => {
      const { ok, results, messages } = data
      if (ok) {
        console.log('data:', results)
      } else {
        enqueueSnackbar(messages)
      }
    },
  })
  
  const closeChangePaymentDialog = useMemo(() => {
    return () => history.push(parentPath(history.location.pathname, -2))
  }, [history])
  const changePaymentSubmit = useCallback(values => {
    const { results: incomes } = queryClient.getQueryData(['types/incomes', { owner }])
    const { _id: income } = find(incomes, { display: values.income })
    mutation.mutate({ id: targetDocId, set: { income } })
    const newRows = changePayment(closedRows, targetDocId, values.income)
    queryClient.setQueryData(fetchKey, { ok: true, results: newRows })
    closeChangePaymentDialog()
    return values
  }, [closeChangePaymentDialog, closedRows, fetchKey, mutation, owner, queryClient, targetDocId])
  
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
      title={intl.formatMessage(messages['menu_closed_tables'])}
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
                  disabled={!startDate}
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
          <FormattedMessage defaultMessage="Tavoli chiusi" id="reports.closed_tables.header_title"/>
        </StandardHeader>
        <RightDrawer open={openFilter} switchOpen={switchOpenFilter}>
          {FilterFormWr}
        </RightDrawer>
      </div>
      <DateRangeFormikWrapper
        endDate={endDate}
        setDateRange={setDateRange}
        startDate={startDate}
      />
      <DivContentWrapper>
        <Paper className={classes.paper}>
          <TableList isFetching={effectiveFetching && !closedRows.length} isIdle={isIdle} rows={closedRows}/>
        </Paper>
      </DivContentWrapper>
      {docId && <EntriesTableDialog docId={docId} urlKey="reports/closed_table"/>}
      {targetDocId && <ChangePaymentDialog close={closeChangePaymentDialog} onSubmit={changePaymentSubmit}/>}
    </Page>
  )
}

export default ClosedTables
