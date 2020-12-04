import React, { memo, useRef, useState } from 'react'
import Page from 'src/components/Page'
import { Box, Button, CircularProgress, IconButton, makeStyles } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { DesktopDatePickerField } from 'src/components/DateRange'
import StandardHeader from 'src/components/StandardHeader'
import { Field, Form, Formik } from 'formik'
import shallow from 'zustand/shallow'
import { useQuery } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import Paper from '@material-ui/core/Paper'
import TableList from './TableList'
import useClosingDayStore from 'src/zustandStore/useClosingDayStore'
import { useParams } from 'react-router'
import ClosingDayDialog from './ClosingDayDialog'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'
import ReplayIcon from '@material-ui/icons/Replay'
import { useSnackQueryError } from 'src/utils/reactQueryFunctions'
import { getEffectiveFetching } from 'src/utils/logics'
import moment from 'moment'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    height: '100%',
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  wrapper: {
    position: 'relative',
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
  progress: {
    color: theme.palette.primary.main,
    position: 'absolute',
    top: 4,
    left: 4,
  },
  innerFirst: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      padding: 0,
    },
  },
}))

/*const DEBUG_DATA = [
  {
    _id: 'CLOSING_DAY_20200930225455',
    date: '20200930225455',
    owner: 'TEST123',
    pu_totale_sc: 2200,
    pu_totale_st: 5000,
    pu_totale_nc: 16,
    pu_totale_totale: 489300,
  },
]*/

function IconButtonLoader ({ onClick, isFetching }) {
  const classes = useStyles()
  return (
    <Box className={classes.wrapper}>
      <IconButton
        color="primary"
        onClick={onClick}
      >
        {isFetching ? <HourglassEmptyIcon/> : <ReplayIcon/>}
      </IconButton>
      {isFetching && <CircularProgress className={classes.progress} size={40} thickness={2}/>}
    </Box>
  )
}

const FormikWrapper = memo((function FormikWrapper ({ startDate, endDate, refetch, isFetching }) {
  console.log('%cRENDER_FORMIK_WRAPPER', 'color: orange')
  const endDateRef = useRef(null)
  const startDateRef = useRef(null)
  const [open, setOpen] = useState(false)
  const setDateRange = useClosingDayStore(state => state.setDateRange)
  return (
    <Box alignItems="center" display="flex">
      <Box mr={2}>
        <Formik
          initialValues={{ dateRange: [startDate, endDate] }}
          onSubmit={
            value => {
              endDateRef.current.blur()
              startDateRef.current.blur()
              setOpen(false)
              setDateRange(value.dateRange)
            }
          }
        >
          <Form>
            <Field
              component={DesktopDatePickerField}
              endDateRef={endDateRef}
              name="dateRange"
              open={open}
              setDateRange={setDateRange}
              setOpen={setOpen}
              startDateRef={startDateRef}
            />
            <Button style={{ display: 'none' }} type="submit"/>
          </Form>
        </Formik>
      </Box>
      <IconButtonLoader
        isFetching={isFetching}
        onClick={
          () => {
            refetch().then()
          }
        }
      />
    </Box>
  )
}))

const closingSelector = state => ({
  endDate: state.endDate,
  startDate: state.startDate,
  closingRows: state.closingRows,
  setClosingRows: state.setClosingRows,
})

const ClosingDay = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const { docId } = useParams()
  const classes = useStyles()
  //const queryCache = useQueryCache()
  const snackQueryError = useSnackQueryError()
  const intl = useIntl()
  let { startDate, endDate, closingRows, setClosingRows } = useClosingDayStore(closingSelector, shallow)
  /* useEffect(() => {return () => {reset()}}, [reset])*/
  const { isIdle, refetch, ...rest } = useQuery(['reports/closing_days', {
    startDateInMillis: moment(startDate).format('YYYYMMDDHHmmssSSS'),
    endDateInMillis: moment(endDate).format('YYYYMMDDHHmmssSSS'),
    owner,
  }], {
    onError: snackQueryError,
    enabled: startDate && endDate,
    onSettled: data => {
      if (data.ok) {
        setClosingRows(data.results)
      }
    },
  })
  const effectiveFetching = getEffectiveFetching(rest)
  /*useEffect(() => {
    async function fetchData () {
      await queryCache.prefetchQuery(['queries/query_by_type', {
        type: 'USER',
        owner,
      }], { throwOnError: true })
    }
    
    fetchData().then().catch(error => {setState(() => {throw error})})
  }, [owner, queryCache])*/
  //const rows = data.results || []
  return (
    <Page
      className={classes.root}
      title={intl.formatMessage(messages['menu_closing_day'])}
    >
      <Box p={3} pb={2}>
        <StandardHeader>
          <FormattedMessage defaultMessage="Chiusure di giornata" id="reports.closing_day.header_title"/>
        </StandardHeader>
      </Box>
      <div className={classes.content}>
        <div className={classes.innerFirst}>
          <Box display="flex">
            <FormikWrapper endDate={endDate} isFetching={effectiveFetching} refetch={refetch} startDate={startDate}/>
          </Box>
          <Paper className={classes.paper}>
            <TableList isFetching={effectiveFetching && !closingRows.length} isIdle={isIdle} rows={closingRows}/>
          </Paper>
        </div>
      </div>
      <ClosingDayDialog docId={docId}/>
    </Page>
  )
}

export default ClosingDay
