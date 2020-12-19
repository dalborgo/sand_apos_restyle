import React, { memo, useEffect, useState } from 'react'
import clsx from 'clsx'
import * as Yup from 'yup'
import ErrorSuspenseWrapper from 'src/components/ErrorSuspenseWrapper'
import { FastField, Formik } from 'formik'
import { Box, Button, makeStyles } from '@material-ui/core'
import { TextField } from 'formik-material-ui'
import useAuth from 'src/hooks/useAuth'
import useIsMountedRef from 'src/hooks/useIsMountedRef'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { useSnackQueryError } from 'src/utils/reactQueryFunctions'
import CodeAutocomplete from './CodeAutocomplete'
import { useQueryClient } from 'react-query'

const useStyles = makeStyles(theme => ({
  helperText: {
    position: 'absolute',
    bottom: -20,
  },
  field: {
    marginBottom: theme.spacing(2),
  },
}))

const focus = event => event.target.select()
const isAsten = username => username?.toLowerCase() === 'asten'

const JWTLogin = memo(({ className, ...rest }) => {
  const classes = useStyles()
  const { login } = useAuth()
  const queryClient = useQueryClient()
  const intl = useIntl()
  // eslint-disable-next-line no-unused-vars
  const [_, setState] = useState()
  useEffect(() => {
    async function fetchData () {
      await queryClient.prefetchQuery('jwt/codes', { throwOnError: true })
    }
    
    fetchData().then().catch(error => {setState(() => {throw error})}) //trick to send error to boundaries
  }, [queryClient])
  const isMountedRef = useIsMountedRef()
  const snackQueryError = useSnackQueryError()
  return (
    <Formik
      initialValues={
        {
          code: null,
          password: '',
          submit: null,
          username: '',
        }
      }
      onSubmit={
        async (values, {
          setStatus,
          setSubmitting,
        }) => {
          try {
            await login(values.username, values.password, values?.code)
            if (isMountedRef.current) {
              setStatus({ success: true })
              setSubmitting(false)
            }
          } catch (err) {
            snackQueryError(err)
            if (isMountedRef.current) {
              setStatus({ success: false })
              setSubmitting(false)
            }
          }
        }
      }
      validationSchema={
        Yup.object().shape({
          username: Yup.string().required(intl.formatMessage(messages.username_required)),
          password: Yup.string().required(intl.formatMessage(messages.password_required)),
          code: Yup.object().nullable()
            .when('username', {
              is: username => isAsten(username),
              then: Yup.object().required(intl.formatMessage(messages.installation_required)),
            }),
        })
      }
    >
      {
        ({
          dirty,
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
          setFieldTouched,
          setFieldValue,
          values,
        }) => (
          <form
            className={clsx(classes.root, className)}
            noValidate
            onSubmit={handleSubmit}
            {...rest}
          >
            <FastField
              autoFocus
              className={classes.field}
              component={TextField}
              FormHelperTextProps={
                {
                  classes: { root: classes.helperText },
                }
              }
              fullWidth
              label="Nome Utente"
              margin="normal"
              name="username"
              onChange={handleChange}
              onFocus={focus}
              required
              type="text"
              value={values.username}
              variant="outlined"
            />
            <FastField
              className={classes.field}
              component={TextField}
              FormHelperTextProps={
                {
                  classes: { root: classes.helperText },
                }
              }
              fullWidth
              label="Password"
              margin="normal"
              name="password"
              onChange={handleChange}
              onFocus={focus}
              required
              type="password"
              value={values.password}
              variant="outlined"
            />
            {
              isAsten(values['username']) &&
              <ErrorSuspenseWrapper message={intl.formatMessage(messages['error_to_fetch_codes'])} variant="default">
                <CodeAutocomplete
                  setFieldTouched={setFieldTouched}
                  setFieldValue={setFieldValue}
                />
              </ErrorSuspenseWrapper>
            }
            <Box mt={2}>
              <Button
                color="secondary"
                disabled={isSubmitting || !isValid || !dirty}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
              >
                <FormattedMessage defaultMessage="Entra" id="auth.login.enter"/>
              </Button>
            </Box>
          </form>
        )
      }
    </Formik>
  )
})

JWTLogin.displayName = 'JWTLogin'

export default JWTLogin
