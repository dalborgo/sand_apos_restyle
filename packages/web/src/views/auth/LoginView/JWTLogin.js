import React from 'react'
import clsx from 'clsx'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
import { Formik } from 'formik'
import { Box, Button, makeStyles, TextField } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import useAuth from 'src/hooks/useAuth'
import useIsMountedRef from 'src/hooks/useIsMountedRef'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { useSnackQueryError } from 'src/utils/reactQueryFunctions'

const useStyles = makeStyles(() => ({
  root: {},
}))

const JWTLogin = ({ className, ...rest }) => {
  const classes = useStyles()
  const { login } = useAuth()
  const isMountedRef = useIsMountedRef()
  const intl = useIntl()
  const snackQueryError = useSnackQueryError()
  return (
    <Formik
      initialValues={
        {
          username: 'asten',
          password: '90210',
          submit: null,
        }
      }
      onSubmit={
        async (values, {
          setStatus,
          setSubmitting,
        }) => {
          try {
            await login(values.username, values.password)
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
        })
      }
    >
      {
        ({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
          touched,
          values,
        }) => (
          <form
            className={clsx(classes.root, className)}
            noValidate
            onSubmit={handleSubmit}
            {...rest}
          >
            <TextField
              autoFocus
              error={Boolean(touched.username && errors.username)}
              fullWidth
              helperText={touched.username && errors.username}
              label="Nome Utente"
              margin="normal"
              name="username"
              onBlur={handleBlur}
              onChange={handleChange}
              type="text"
              value={values.username}
              variant="outlined"
            />
            <TextField
              error={Boolean(touched.password && errors.password)}
              fullWidth
              helperText={touched.password && errors.password}
              label="Password"
              margin="normal"
              name="password"
              onBlur={handleBlur}
              onChange={handleChange}
              type="password"
              value={values.password}
              variant="outlined"
            />
            <Box mt={2}>
              <Button
                color="secondary"
                disabled={isSubmitting}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
              >
                <FormattedMessage defaultMessage="Entra" id="auth.login.enter"/>
              </Button>
            </Box>
            <Box mt={2}>
              <Alert
                severity="info"
              >
                <div>
                  Use
                  {' '}
                  <b>demo@devias.io</b>
                  {' '}
                  and password
                  {' '}
                  <b>Password123</b>
                </div>
              </Alert>
            </Box>
          </form>
        )
      }
    </Formik>
  )
}

JWTLogin.propTypes = {
  className: PropTypes.string,
}

export default JWTLogin
