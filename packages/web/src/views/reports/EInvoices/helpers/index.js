import { axiosLocalInstance } from 'src/utils/reactQueryFunctions'
import React from 'react'
import { Grid, useTheme } from '@material-ui/core'
import LabeledTypo from '../../../../components/LabeledTypo'
import { useDateFormatter, useMoneyFormatter } from '../../../../utils/formatters'

export async function sendXml (owner, setLoading, docId, endDateInMillis, startDateInMillis, queryClient) {
  const data = { owner }
  setLoading(true)
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
  setLoading(false)
  const fetchKey = ['reports/e_invoices', {
    endDateInMillis,
    owner,
    startDateInMillis,
  }]
  const { results: arrPayment } = queryClient.getQueryData(fetchKey)
  
  const newArrPayment = []
  for (let payment of arrPayment) {
    if (docId === payment._id) {
      newArrPayment.push({ ...payment, statusCode: results })
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
  return { ok, message }
}


export function EInvoiceHeaderDialog ({ company, number, room, table, date, amount}) {
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
