import React, { memo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { FastField, Form, Formik } from 'formik'
import { Button, Grid, InputLabel, useTheme } from '@material-ui/core'
import { useLocation } from 'react-router-dom'
import { Switch, TextField } from 'formik-material-ui'
import { messages } from 'src/translations/messages'
import LoadingLinearBoxed from 'src/components/LoadingLinearBoxed'
import { EInvoiceHeaderDialog, isCompanyDataEditable } from '../../../helpers'

const TextRow = ({ message, name }) => {
  const { state = {} } = useLocation()
  const intl = useIntl()
  const isEditable = isCompanyDataEditable(state.status)
  return (
    <FastField
      component={TextField}
      disabled={!isEditable}
      fullWidth
      label={intl.formatMessage(messages[message])}
      name={name}
      size="small"
      variant="outlined"
    />
  )
}

const ChangeCustomerForm = memo(function ChangeCustomerForm ({ onSubmit, data, isLoading }) {
  const theme = useTheme()
  const intl = useIntl()
  const { state = {} } = useLocation()
  const { results } = data || {}
  const isEditable = isCompanyDataEditable(state.status)
  // eslint-disable-next-line no-unused-vars
  const { type, ...initialValues } = results
  if (isLoading) {
    return <LoadingLinearBoxed boxHeight={40}/>
  } else {
    if (data?.ok) {
      return (
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
        >
          {
            ({ dirty, values, handleChange }) => (
              <Form style={{ height: '100%' }}>
                <Grid
                  alignItems="stretch"
                  container
                  direction="column"
                  justify="space-between"
                  style={{ height: '100%', minWidth: 350 }}
                >
                  {
                    state?.company &&
                    <EInvoiceHeaderDialog {...state}/>
                  }
                  <Grid item style={{ textAlign: 'center', margin: theme.spacing(1, 3, 0) }}>
                    <TextRow message="reports_e_invoices_customer_vat" name="iva"/>
                  </Grid>
                  <Grid item style={{ textAlign: 'center', margin: theme.spacing(2, 3, 0) }}>
                    <TextRow message="reports_e_invoices_fiscal_code" name="cf"/>
                  </Grid>
                  <Grid item style={{ textAlign: 'center', margin: theme.spacing(2, 3, 0) }}>
                    <TextRow message="reports_e_invoices_company" name="company"/>
                  </Grid>
                  <Grid item style={{ textAlign: 'center', margin: theme.spacing(2, 3, 0) }}>
                    <TextRow message="reports_e_invoices_address" name="address"/>
                  </Grid>
                  <Grid item style={{ textAlign: 'center', margin: theme.spacing(2, 3, 0) }}>
                    <TextRow message="reports_e_invoices_zip" name="zip_code"/>
                  </Grid>
                  <Grid item style={{ textAlign: 'center', margin: theme.spacing(2, 3, 0) }}>
                    <TextRow message="reports_e_invoices_city" name="city"/>
                  </Grid>
                  <Grid item style={{ textAlign: 'center', margin: theme.spacing(2, 3, 0) }}>
                    <TextRow message="reports_e_invoices_district" name="prov"/>
                  </Grid>
                  <Grid item style={{ textAlign: 'center', margin: theme.spacing(2, 3, 0) }}>
                    <TextRow message="reports_e_invoices_state" name="state"/>
                  </Grid>
                  <Grid item style={{ textAlign: 'center', margin: theme.spacing(2, 3, 0) }}>
                    <TextRow message="reports_e_invoices_sdi" name="sdi"/>
                  </Grid>
                  <Grid item style={{ textAlign: 'center', margin: theme.spacing(2, 3, 0) }}>
                    <TextRow message="reports_e_invoices_pec" name="pec"/>
                  </Grid>
                  <Grid item style={{ textAlign: 'center', margin: theme.spacing(2, 3, 0) }}>
                    <TextRow message="reports_e_invoices_contact" name="contact"/>
                  </Grid>
                  <Grid item style={{ margin: theme.spacing(1.5, 4, isEditable ? 1 : 2) }}>
                    <InputLabel
                      disabled={!isEditable}
                      htmlFor="split_payment"
                    >
                      {intl.formatMessage(messages['reports_e_invoices_split_payment'])}
                      <FastField
                        component={Switch}
                        disabled={!isEditable}
                        name="split_payment"
                        onChange={
                          event => {
                            handleChange(event)
                          }
                        }
                        type="checkbox"
                      />
                    </InputLabel>
                  </Grid>
                  {
                    isEditable &&
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
                  }
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
