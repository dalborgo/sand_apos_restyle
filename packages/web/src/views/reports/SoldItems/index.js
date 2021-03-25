import React, { memo, useCallback, useMemo, useState } from 'react'
import Page from 'src/components/Page'
import { Box, Button, makeStyles, Paper, TextField, TextField as TF } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import StandardHeader from 'src/components/StandardHeader'
import { StandardBreadcrumb } from 'src/components/StandardBreadcrumb'
import DivContentWrapper from 'src/components/DivContentWrapper'
import DateRangeFormikWrapper from 'src/components/DateRangeFormikWrapper'
import { DesktopTimePicker } from '@material-ui/pickers'
import shallow from 'zustand/shallow'
import useAuth from 'src/hooks/useAuth'
import { useQuery } from 'react-query'
import { useSnackQueryError } from 'src/utils/reactQueryFunctions'
import { getEffectiveFetchingWithPrev } from 'src/utils/logics'
import IconButtonLoader from 'src/components/IconButtonLoader'
import TableList from './TableList'
import FilterButton from 'src/components/FilterButton'
import RightDrawer from 'src/components/RightDrawer'
import { FastField, Field, Form, Formik } from 'formik'
import LoadingLinearBoxed from 'src/components/LoadingLinearBoxed'
import { validation } from '@adapter/common'
import { useGeneralStore, useSoldItemsStore } from 'src/zustandStore'

const useStyles = makeStyles(theme => ({
  paper: {
    height: '100%',
  },
  container: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {// mobile
      padding: theme.spacing(0, 2, 2),
    },
  },
}))

const DesktopTimePickerField = ({
  field: { value, name },
  form,
  ...other
}) => {
  return (
    <DesktopTimePicker
      ampm={false}
      clearable
      label="For desktop"
      onChange={time => form.setFieldValue(name, time, false)}
      renderInput={props => <TextField {...props} />}
      value={value}
      {...other}
    />
  )
}

const FilterForm = memo(function FilterForm ({ startTimeFilter, roomFilter, onSubmit }) {
  console.log('%cRENDER_FORM', 'color: pink')
  const { selectedCode: { code: owner } } = useAuth()
  const intl = useIntl()
  const { isLoading, data } = useQuery(['types/rooms', { owner }], {
    notifyOnChangeProps: ['data', 'error'],
    staleTime: Infinity, //non aggiorna la cache delle stanze ogni volta che si apre la drawer (richiesto refresh)
  })
  return (
    <Formik
      initialValues={{ room: roomFilter, startTime: startTimeFilter }}
      onSubmit={onSubmit}
    >
      {
        ({ handleChange, dirty, setValues, values }) => (
          <Form>
            <Box mb={3}>
              <Field
                component={DesktopTimePickerField}
                name="startTime"
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
                    onFocus={() => null}
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

const soldItemsSelector = state => ({
  endDate: state.endDate,
  endDateInMillis: state.endDateInMillis,
  openFilter: state.openFilter,
  roomFilter: state.filter.room,
  setDateRange: state.setDateRange,
  startDate: state.startDate,
  startTimeFilter: state.filter.startTime,
  startDateInMillis: state.startDateInMillis,
  submitFilter: state.submitFilter,
  switchOpenFilter: state.switchOpenFilter,
})
const selAllIn = state => state.allIn
const SoldItems = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const allIn = useGeneralStore(selAllIn)
  const snackQueryError = useSnackQueryError()
  const [isRefetch, setIsRefetch] = useState(false)
  const intl = useIntl()
  const {
    endDate,
    endDateInMillis,
    openFilter,
    setDateRange,
    startDate,
    startDateInMillis,
    switchOpenFilter,
    roomFilter,
    startTimeFilter,
    submitFilter,
  } = useSoldItemsStore(soldItemsSelector, shallow)
  const fetchKey = useMemo(() => ['reports/sold_items', {
    bb: allIn,
    start: startDateInMillis,
    owner,
    roomFilter,
    startTime: String(startTimeFilter || ''),
    end: endDateInMillis,
  }], [allIn, endDateInMillis, owner, roomFilter, startDateInMillis, startTimeFilter])
  const { data, refetch, ...rest } = useQuery(fetchKey, {
    enabled: Boolean(startDate && endDate),
    keepPreviousData: true,
    notifyOnChangeProps: ['data', 'error'],
    onError: snackQueryError,
  })
  const refetchOnClick = useCallback(async () => {
    setIsRefetch(true)
    await refetch()
    setIsRefetch(false)
  }, [refetch])
  const onFilterSubmit = useCallback(filter => {
    submitFilter(filter)
    return filter
  }, [submitFilter])
  const FilterFormWr = useMemo(() => (
    <FilterForm onSubmit={onFilterSubmit} roomFilter={roomFilter}/>
  ), [onFilterSubmit, roomFilter])
  const effectiveFetching = getEffectiveFetchingWithPrev(rest, isRefetch)
  console.log('data:', data)
  return (
    <Page
      title={intl.formatMessage(messages['menu_sold_items'])}
    >
      <div className={classes.container}>
        <StandardHeader
          breadcrumb={
            <StandardBreadcrumb
              crumbs={[{ to: '/app', name: 'Home' }, { name: 'Report' }]}
            />
          }
          rightComponent={
            <Box alignItems="center" display="flex">
              <Box>
                <IconButtonLoader
                  disabled={!startDate}
                  isFetching={effectiveFetching}
                  onClick={refetchOnClick}
                />
              </Box>
              <Box>
                <FilterButton
                  isActive={roomFilter}
                  onClick={switchOpenFilter}
                />
              </Box>
            </Box>
          }
        >
          <FormattedMessage defaultMessage="Venduto" id="management.sold_items.header_title"/>
        </StandardHeader>
        <RightDrawer open={openFilter} switchOpen={switchOpenFilter}>
          {FilterFormWr}
        </RightDrawer>
      </div>
      <Box alignItems="center" display="flex" p={2} pt={1}>
        <DateRangeFormikWrapper
          endDate={endDate}
          setDateRange={setDateRange}
          startDate={startDate}
        />
      </Box>
      <DivContentWrapper>
        <Paper className={classes.paper}>
          <TableList
            isFetching={effectiveFetching && !data?.results?.length}
            isIdle={rest.isIdle}
            rows={data?.results || []}
          />
        </Paper>
      </DivContentWrapper>
    </Page>
  )
}

export default SoldItems
