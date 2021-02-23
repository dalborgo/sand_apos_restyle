import { axiosLocalInstance } from 'src/utils/reactQueryFunctions'
import React from 'react'
import { Grid, useTheme } from '@material-ui/core'
import LabeledTypo from 'src/components/LabeledTypo'
import { useDateFormatter, useMoneyFormatter } from 'src/utils/formatters'

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
  queryClient.invalidateQueries(['queries/query_by_id', { id: docId, columns: ['fatt_elett'] }]).then()
}

export async function sendXml (owner, docId, endDateInMillis, startDateInMillis, queryClient) {
  const data = { owner }
  const {
    data: {
      ok,
      results,
      message,
    },
  } = await axiosLocalInstance(`e-invoices/send_xml/${docId}`, {
    data,
    method: 'post',
  })
  invalidateRows(endDateInMillis, owner, startDateInMillis, queryClient, docId, results)
  return { ok, message }
}

export async function loadStatus (owner, docId, endDateInMillis, startDateInMillis, queryClient) {
  const data = { owner }
  const {
    data: {
      ok,
      results,
      message,
    },
  } = await axiosLocalInstance(`e-invoices/update_state/${docId}`, {
    data,
    method: 'put',
  })
  const { newStatus } = results || {}
  newStatus && invalidateRows(endDateInMillis, owner, startDateInMillis, queryClient, docId, newStatus)// solo se lo status è cambiato
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
          <Grid item>
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
      <Grid item style={{ margin: theme.spacing(0, 3, 2) }}>
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
