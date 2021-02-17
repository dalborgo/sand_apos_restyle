import React, { memo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { FastField, Form, Formik } from 'formik'
import { Box, Button, Grid, useTheme } from '@material-ui/core'
import LoadingLinearBoxed from 'src/components/LoadingLinearBoxed'
import ToggleButton from '@material-ui/lab/ToggleButton'
import { ToggleButtonGroup } from 'formik-material-ui-lab'
import { useLocation } from 'react-router-dom'
import LabeledTypo from 'src/components/LabeledTypo'
import { useDateFormatter, useMoneyFormatter } from 'src/utils/formatters'
import { TextField } from 'formik-material-ui'
import { messages } from '../../../../../../translations/messages'

const ChangeCustomerForm = memo(function ChangeCustomerForm ({ onSubmit, data, isLoading }) {
  console.log('%cRENDER_FORM', 'color: pink')
  const theme = useTheme()
  const intl = useIntl()
  const { state: { income, room, table, date, amount } } = useLocation()
  const moneyFormatter = useMoneyFormatter()
  const dateFormatter = useDateFormatter()
  return (
    <Formik
      initialValues={{ income }}
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
              <Grid item style={{ margin: theme.spacing(0, 3) }}>
                <Grid container justify="space-between" style={{ width: '100%' }}>
                  <Grid item>
                    <LabeledTypo label="common_date" text={dateFormatter(date)}/>
                  </Grid>
                  <Grid item>
                    <LabeledTypo label="common_total" text={moneyFormatter(amount)}/>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item style={{ textAlign: 'center', margin: theme.spacing(3) }}>
                {
                  isLoading ?
                    <LoadingLinearBoxed boxHeight={40}/>
                    :
                    data?.ok &&
                    <FastField
                      component={TextField}
                      fullWidth
                      label={intl.formatMessage(messages['reports.e_invoices_customer_vat'])}
                      name="table"
                      onFocus={event => event.target.select()}
                      size="small"
                      variant="outlined"
                    />
                }
              </Grid>
              <Grid item style={{ margin: theme.spacing(2, 3), marginTop: theme.spacing(1) }}>
                <Button color="secondary" disabled={!dirty || !values['income']} fullWidth type="submit" variant="contained">
                  <FormattedMessage defaultMessage="Applica" id="common.apply"/>
                </Button>
              </Grid>
            </Grid>
          </Form>
        )
      }
    </Formik>
  )
})

export default ChangeCustomerForm
