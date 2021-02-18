import React, { memo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { FastField, Form, Formik } from 'formik'
import { Button, Grid, useTheme } from '@material-ui/core'
import { useLocation } from 'react-router-dom'
import LabeledTypo from 'src/components/LabeledTypo'
import { useDateFormatter, useMoneyFormatter } from 'src/utils/formatters'
import { TextField } from 'formik-material-ui'
import { messages } from 'src/translations/messages'
import LoadingLinearBoxed from 'src/components/LoadingLinearBoxed'

const ChangeCustomerForm = memo(function ChangeCustomerForm ({ onSubmit, data, isLoading }) {
  console.log('%cRENDER_FORM', 'color: pink')
  const theme = useTheme()
  const intl = useIntl()
  const { state = {} } = useLocation()
  const { company, number, room, table, date, amount } = state
  const moneyFormatter = useMoneyFormatter()
  const dateFormatter = useDateFormatter()
  const { results: { iva } } = data || {}
  if (isLoading) {
    return <LoadingLinearBoxed boxHeight={40}/>
  } else {
    if (data?.ok) {
      return (
        <Formik
          initialValues={{ iva }}
          onSubmit={onSubmit}
        >
          {
            ({ dirty, values }) => (
              <Form style={{ height: '100%' }}>
                <Grid
                  alignItems="stretch"
                  container
                  direction="column"
                  justify="space-between"
                  style={{ height: '100%' }}
                >
                  {
                    state?.company &&
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
                  }
                  <Grid item style={{ textAlign: 'center', margin: theme.spacing(2, 3, 3) }}>
                    <FastField
                      component={TextField}
                      fullWidth
                      label={intl.formatMessage(messages['reports_e_invoices_customer_vat'])}
                      name="iva"
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item style={{ margin: theme.spacing(2, 3), marginTop: theme.spacing(1) }}>
                    <Button
                      color="secondary"
                      disabled={!dirty || !values['iva']}
                      fullWidth
                      type="submit"
                      variant="contained"
                    >
                      <FormattedMessage defaultMessage="Applica" id="common.apply"/>
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )
          }
        </Formik>
      )
    }
  }
})

export default ChangeCustomerForm
