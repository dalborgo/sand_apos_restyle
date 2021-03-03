import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, makeStyles, SvgIcon, TextField as TF } from '@material-ui/core'
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
import ExcelJS from 'exceljs'
import saveAs from 'file-saver'
import { useGeneralStore } from 'src/zustandStore'
import { ctol, useDateTimeFormatter } from 'src/utils/formatters'
import { DownloadCloud as DownloadCloudIcon } from 'react-feather'

const useStyles = makeStyles(theme => ({
  paper: {
    [theme.breakpoints.up('md')]: {// mobile
      height: '100%',
    },
  },
  downloadButton: {
    paddingRight: 1,
    paddingLeft: 1,
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
  find(newRows, row => {
    if (Array.isArray(row.payments)) {
      const payment = find(row.payments, { _id })
      if (payment) {
        payment.income = income
        return payment
      }
    } else {
      if (row.payments._id === _id) {
        row.payments.income = income
        return true
      }
    }
  })
  return newRows
}

const companySelect = useGeneralStore.getState().companySelect //viene eseguita quindi può star fuori

function createExcel (intl, dateTimeFormatter, closedRows, owner) {
  const workbook = new ExcelJS.Workbook()
  const ws = workbook.addWorksheet('Dati')
  const columns = [
    { key: 'owner', header: intl.formatMessage(messages['common_building']), width: 15 },
    { key: 'date', header: intl.formatMessage(messages['common_date']), width: 20 },
    { key: 'table', header: intl.formatMessage(messages['common_table']), width: 15 },
    { key: 'room', header: intl.formatMessage(messages['common_room']), width: 15 },
    { key: 'type', header: intl.formatMessage(messages['common_type']), width: 15 },
    { key: 'payment', header: intl.formatMessage(messages['common_type_payment']), width: 20 },
    { key: 'covers', header: intl.formatMessage(messages['common_covers']) },
    { key: 'amount', header: intl.formatMessage(messages['common_cashed']), style: { numFmt: '0.00' } },
    { key: 'discount', header: intl.formatMessage(messages['common_discounts']), style: { numFmt: '0.00' } },
  ]
  ws.columns = columns
  const letter = ctol(columns)
  ws.getCell(`${letter['covers']}1`).alignment = { horizontal: 'right' }
  ws.getCell(`${letter['amount']}1`).alignment = { horizontal: 'right' }
  ws.getCell(`${letter['discount']}1`).alignment = { horizontal: 'right' }
  let fpTotal = 0, dsTotal = 0, covTotal = 0, count = 1
  for (let row of closedRows) {
    count++
    const first = row.payments
    const fp = row.final_price / 1000
    const ds = row.discount_price / 1000
    covTotal += row.covers
    fpTotal += fp
    dsTotal += ds
    const isDivided = Array.isArray(row.payments)
    const row_ = {
      owner: companySelect(owner),
      date: dateTimeFormatter(row.date),
      table: row.table_display,
      room: row.room_display,
      type: isDivided ? intl.formatMessage(messages['common_dividedPayment']) : intl.formatMessage(messages[`mode_${first.mode}`] || messages['mode_OTHER']),
      payment: Array.isArray(row.payments) ? row.payments.map(row => row.income || intl.formatMessage(messages['common_other']).toUpperCase()).join(', ') : first.income,
      covers: row.covers,
      amount: fp,
      discount: ds || '',
    }
    ws.addRow(row_)
    if (isDivided) {
      ws.getCell(`${letter['type']}${count}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E1E1E1' } }
    }
  }
  const rl = closedRows.length + 1
  ws.addRow({
    covers: { formula: `SUM(${letter['covers']}2:${letter['covers']}${rl})`, result: covTotal || '' },
    amount: { formula: `SUM(${letter['amount']}2:${letter['amount']}${rl})`, result: fpTotal || '' },
    discount: { formula: `SUM(${letter['discount']}2:${letter['discount']}${rl})`, result: dsTotal || '' },
  })
  workbook.xlsx.writeBuffer().then(buffer => {
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'DataGrid.xlsx')
  })
}

const selAllIn = state => state.allIn
const ClosedTables = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const allIn = useGeneralStore(selAllIn)
  const { docId, targetDocId } = useParams()
  const history = useHistory()
  const queryClient = useQueryClient()
  const intl = useIntl()
  const [, setState] = useState()
  const snackQueryError = useSnackQueryError()
  const dateTimeFormatter = useDateTimeFormatter()
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
    allIn,
    endDateInMillis: endDate ? moment(endDate).format('YYYYMMDDHHmmssSSS') : undefined,
    owner,
    roomFilter,
    startDateInMillis: startDate ? moment(startDate).format('YYYYMMDDHHmmssSSS') : undefined,
    tableFilter,
  }], [allIn, endDate, owner, roomFilter, startDate, tableFilter])
  const { refetch, isIdle, ...rest } = useQuery(fetchKey, {
    onError: snackQueryError,
    enabled: Boolean(startDate && endDate),
    onSettled: data => {// fa risparmiare un expensive rendere al primo caricamento rispetto a useEffect
      if (data?.ok) {
        setClosedRows(data.results)
      }
    },
  })
  
  const mutation = useMutation(changePaymentMutation, {
    onMutate: async ({ id, display }) => {
      await queryClient.cancelQueries(fetchKey)
      const previousRows = queryClient.getQueryData(fetchKey)
      const newRows = changePayment(closedRows, id, display)
      queryClient.setQueryData(fetchKey, { ok: true, results: newRows })
      return { previousRows }
    },
    onSettled: (data, error, variables, context) => {
      const { ok, message, err } = data || {}
      if (!ok || error) {
        queryClient.setQueryData(fetchKey, context.previousRows)
        snackQueryError(err || message || error)
      }
      queryClient.invalidateQueries('reports/closed_tables', {// cerca di refetchare in background anche quella disabled
        predicate: ({ queryKey }) => {
          const [, second] = queryKey
          return Boolean(second.endDateInMillis && second.startDateInMillis && queryKey !== fetchKey)
        },
        refetchInactive: true,
      }).then()
    },
  })
  
  const closeChangePaymentDialog = useMemo(() => {
    return () => history.push(parentPath(history.location.pathname, -2))
  }, [history])
  const changePaymentSubmit = useCallback(values => {
    const { results: incomes } = queryClient.getQueryData(['types/incomes', { owner }])
    // eslint-disable-next-line camelcase
    const { _id: income_id, key: income } = find(incomes, { display: values.income })
    mutation.mutate({ id: targetDocId, set: { income_id, income }, owner, display: values.income })// display serve in onMutate
    closeChangePaymentDialog()
    return values
  }, [closeChangePaymentDialog, mutation, owner, queryClient, targetDocId])
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
  
  const onSave = useCallback(() => {
    createExcel(intl, dateTimeFormatter, closedRows, owner)
  }, [closedRows, dateTimeFormatter, intl, owner])
  
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
      <Box alignItems="center" display="flex" p={2} pt={1}>
        <Box flexGrow={1}>
          <DateRangeFormikWrapper
            endDate={endDate}
            setDateRange={setDateRange}
            startDate={startDate}
          />
        </Box>
        <Box>
          <Button onClick={onSave} size="small" variant="contained">
            <SvgIcon fontSize="small">
              <DownloadCloudIcon/>
            </SvgIcon>&nbsp;&nbsp;
            {intl.formatMessage(messages['common_exportTable'])}
          </Button>
        </Box>
      </Box>
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
