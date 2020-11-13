import React, { memo, useEffect } from 'react'
import clsx from 'clsx'
import * as Yup from 'yup'
import { FastField, Formik } from 'formik'
import { Box, Button, makeStyles } from '@material-ui/core'
import { TextField } from 'formik-material-ui'
import useAuth from 'src/hooks/useAuth'
import useIsMountedRef from 'src/hooks/useIsMountedRef'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { useSnackQueryError } from 'src/utils/reactQueryFunctions'
import CodeAutocomplete from './CodeAutocomplete'
import { useQueryCache } from 'react-query'

const useStyles = makeStyles(() => ({
  root: {},
}))

const JWTLogin = memo(({ className, ...rest }) => {
  const classes = useStyles()
  const { login } = useAuth()
  const queryCache = useQueryCache()
  useEffect(() => {
    async function fetchData () {
      await queryCache.prefetchQuery('jwt/codes')
    }
    fetchData().then()
  }, [queryCache])
  const isMountedRef = useIsMountedRef()
  const intl = useIntl()
  const snackQueryError = useSnackQueryError()
  return (
    <Formik
      initialValues={
        {
          code: null,
          password: 'rino',
          submit: null,
          username: 'rino',
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
        })
      }
    >
      {
        ({
          errors,
          handleChange,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          touched,
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
              component={TextField}
              error={Boolean(touched.username && errors.username)}
              fullWidth
              helperText={touched.username && errors.username}
              label="Nome Utente"
              margin="normal"
              name="username"
              onChange={handleChange}
              type="text"
              value={values.username}
              variant="outlined"
            />
            <FastField
              component={TextField}
              error={Boolean(touched.password && errors.password)}
              fullWidth
              helperText={touched.password && errors.password}
              label="Password"
              margin="normal"
              name="password"
              onChange={handleChange}
              type="password"
              value={values.password}
              variant="outlined"
            />
            {
              values['username'] === 'asten' &&
              <CodeAutocomplete setFieldValue={setFieldValue}/>
            }
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
          </form>
        )
      }
    </Formik>
  )
})

JWTLogin.whyDidYouRender = true
JWTLogin.displayName = 'JWTLogin'

export default JWTLogin
