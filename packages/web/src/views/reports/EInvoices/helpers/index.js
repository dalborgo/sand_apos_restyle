import { axiosLocalInstance } from 'src/utils/reactQueryFunctions'
import React from 'react'
import { Grid, useTheme } from '@material-ui/core'
import LabeledTypo from 'src/components/LabeledTypo'
import isNil from 'lodash/isNil'
import { useDateFormatter, useMoneyFormatter } from 'src/utils/formatters'
import { messages } from 'src/translations/messages'

function invalidateRows (endDateInMillis, owner, startDateInMillis, queryClient, docId, statusCode) {
  const fetchKey = ['reports/e_invoices', {
    endDateInMillis,
    owner,
    startDateInMillis,
  }]
  const { results: arrPayment } = queryClient.getQueryData(fetchKey)
  
  const newArrPayment = []
  for (let payment of arrPayment) {
    if (docId === payment._id) {
      newArrPayment.push({ ...payment, statusCode })
    } else {
      newArrPayment.push(payment)
    }
  }
  queryClient.setQueryData(fetchKey, { ok: true, results: newArrPayment })
  queryClient.invalidateQueries('reports/e_invoices', {// cerca di refetchare in background anche quella disabled
    predicate: ({ queryKey }) => {
      const [, second] = queryKey
      return Boolean(second.endDateInMillis && second.startDateInMillis)
    },
    refetchInactive: true,
  }).then()
  queryClient.invalidateQueries(['queries/query_by_id', {
    id: docId,
    columns: ['fatt_elett'],
  }], { refetchInactive: true }).then()
}

export async function sendXml (owner, docId, endDateInMillis, startDateInMillis, queryClient) {
  const {
    data: {
      ok,
      results,
      message,
    },
  } = await axiosLocalInstance(`e-invoices/send_xml/${docId}`, {
    method: 'post',
  })
  invalidateRows(endDateInMillis, owner, startDateInMillis, queryClient, docId, results)
  return { ok, message }
}

export async function loadStatus (owner, docId, endDateInMillis, startDateInMillis, queryClient) {
  const {
    data: {
      ok,
      results,
      message,
    },
  } = await axiosLocalInstance(`e-invoices/update_state/${docId}`, {
    method: 'put',
  })
  const { newStatus } = results || {}
  !isNil(newStatus) && invalidateRows(endDateInMillis, owner, startDateInMillis, queryClient, docId, newStatus)// solo se lo status è cambiato
  return { ok, results, message }
}

export function EInvoiceHeaderDialog ({ company, number, room, table, date, amount }) {
  const theme = useTheme()
  const moneyFormatter = useMoneyFormatter()
  const dateFormatter = useDateFormatter()
  return (
    <>
      <Grid item style={{ margin: theme.spacing(0, 3) }}>
        <Grid container justify="space-between" style={{ width: '100%' }}>
          <Grid item style={{marginRight: theme.spacing(2)}}>
            <LabeledTypo label="common_customer" text={company}/>
          </Grid>
          <Grid item>
            <LabeledTypo label="mode_INVOICE" text={number}/>
          </Grid>
        </Grid>
      </Grid>
      <Grid item style={{ margin: theme.spacing(0, 3) }}>
        <Grid container justify="space-between" style={{ width: '100%' }}>
          <Grid item>
            <LabeledTypo label="common_room" text={room}/>
          </Grid>
          <Grid item>
            <LabeledTypo label="common_table" text={table}/>
          </Grid>
        </Grid>
      </Grid>
      <Grid item style={{ margin: theme.spacing(0, 3, 1) }}>
        <Grid container justify="space-between" style={{ width: '100%' }}>
          <Grid item>
            <LabeledTypo label="common_date" text={dateFormatter(date)}/>
          </Grid>
          <Grid item>
            <LabeledTypo label="common_total" text={moneyFormatter(amount)}/>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export const getStatusLabel = (statusCode, intl) => {
  switch (statusCode) {
    case 999:
      return intl.formatMessage(messages['common_error'])
    case 777:
      return intl.formatMessage(messages['reports_e_invoices_refused'])
    case 3:
      return intl.formatMessage(messages['reports_e_invoices_accepted'])
    case 2:
      return intl.formatMessage(messages['reports_e_invoices_sent'])
    case 1:
      return intl.formatMessage(messages['reports_e_invoices_not_delivered_long'])
    case 0:
      return intl.formatMessage(messages['reports_e_invoices_delivered'])
    default:
      return intl.formatMessage(messages['common_undefined'])
  }
}

export const isCompanyDataEditable = status => isNil(status) || status > 3
