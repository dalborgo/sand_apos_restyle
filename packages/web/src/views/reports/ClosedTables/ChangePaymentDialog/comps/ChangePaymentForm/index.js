import React, { memo } from 'react'
import useAuth from 'src/hooks/useAuth'
import { FormattedMessage } from 'react-intl'
import { useQuery } from 'react-query'
import { FastField, Form, Formik } from 'formik'
import { Box, Button } from '@material-ui/core'
import LoadingLinearBoxed from 'src/components/LoadingLinearBoxed'
import ToggleButton from '@material-ui/lab/ToggleButton'
import { ToggleButtonGroup } from 'formik-material-ui-lab'

const ChangePaymentForm = memo(function ChangePaymentForm ({ income, onSubmit }) {
  console.log('%cRENDER_FORM', 'color: pink')
  const { selectedCode: { code: owner } } = useAuth()
  const { isLoading, data } = useQuery(['types/incomes', { owner }], {
    notifyOnChangeProps: ['data', 'error'],
    staleTime: Infinity, //non aggiorna la cache delle stanze ogni volta che si apre la drawer (richiesto refresh)
  })
  return (
    <Formik
      initialValues={{ income }}
      onSubmit={onSubmit}
    >
      {
        ({ dirty }) => (
          <Form>
            <Box mb={4} mt={2} textAlign="center">
              {
                isLoading ?
                  <LoadingLinearBoxed boxHeight={40}/>
                  :
                  data?.ok &&
                  <FastField
                    component={ToggleButtonGroup}
                    exclusive
                    name="income"
                    orientation="vertical"
                    type="checkbox"
                  >
                    {
                      data.results.map(({ display, _id }) => {
                        return (
                          <ToggleButton disableFocusRipple key={_id} value={_id}>
                            {display}
                          </ToggleButton>
                        )
                      })
                    }
                  </FastField>
              }
            </Box>
            <Box display="flex" m={1}>
              <Button color="secondary" disabled={!dirty} fullWidth size="small" type="submit" variant="contained">
                <FormattedMessage defaultMessage="Applica" id="common.apply"/>
              </Button>
            </Box>
          </Form>
        )
      }
    </Formik>
  )
})

export default ChangePaymentForm
