import React, { memo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { FastField, Form, Formik } from 'formik'
import { Button, Grid, useTheme } from '@material-ui/core'
import { useLocation } from 'react-router-dom'
import { TextField } from 'formik-material-ui'
import { messages } from 'src/translations/messages'
import LoadingLinearBoxed from 'src/components/LoadingLinearBoxed'
import { EInvoiceHeaderDialog } from '../../../helpers'

const ChangeCustomerForm = memo(function ChangeCustomerForm ({ onSubmit, data, isLoading }) {
  const theme = useTheme()
  const intl = useIntl()
  const { state = {} } = useLocation()
  const { results: { iva, _id } } = data || {}
  if (isLoading) {
    return <LoadingLinearBoxed boxHeight={40}/>
  } else {
    if (data?.ok) {
      return (
        <Formik
          initialValues={{ iva, _id }}
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
                    <EInvoiceHeaderDialog {...state}/>
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
