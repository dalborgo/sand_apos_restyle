import React, { memo, useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'
import * as Yup from 'yup'
import ErrorSuspenseWrapper from 'src/components/ErrorSuspenseWrapper'
import { FastField, Formik, Field } from 'formik'
import {
  Box,
  Button,
  FormControl,
  FormHelperText, IconButton,
  InputAdornment,
  InputLabel,
  makeStyles,
  OutlinedInput,
} from '@material-ui/core'
import { TextField } from 'formik-material-ui'
import useAuth from 'src/hooks/useAuth'
import useIsMountedRef from 'src/hooks/useIsMountedRef'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { useSnackQueryError } from 'src/utils/reactQueryFunctions'
import CodeAutocomplete from './CodeAutocomplete'
import { useQueryClient } from 'react-query'
import { Visibility, VisibilityOff } from '@material-ui/icons'

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
  const [, setState] = useState()
  const [visibility, setVisibility] = useState(false)
  useEffect(() => {
    async function fetchData () {
      await queryClient.prefetchQuery('jwt/codes', { throwOnError: true })
    }
    fetchData().then().catch(error => {setState(() => {throw error})}) //trick to send error to boundaries
  }, [queryClient])
  const handleClickShowPassword = useCallback(() => {setVisibility(!visibility)},[visibility])
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
        Yup.object().nullable().shape({
          username: Yup.string().required(intl.formatMessage(messages.username_required)),
          password: Yup.string().required(intl.formatMessage(messages.password_required)),
          code: Yup.object().nullable()
            .when('username', {
              is: username => isAsten(username),
              then: Yup.object().required(intl.formatMessage(messages.installation_required)).nullable(),
            }),
        })
      }
    >
      {
        ({
          dirty,
          errors,
          handleChange,
          handleSubmit,
          isSubmitting,
          isValid,
          setFieldTouched,
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
              className={classes.field}
              component={TextField}
              FormHelperTextProps={
                {
                  classes: { root: classes.helperText },
                }
              }
              fullWidth
              label={intl.formatMessage(messages.common_username)}
              margin="normal"
              name="username"
              onChange={handleChange}
              required
              size="medium"
              type="text"
              value={values.username}
              variant="outlined"
            />
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel
                error={errors.password && touched.password}
                htmlFor="outlined-adornment-password"
                required
              >Password
              </InputLabel>
              <Field //con fastfield non va
                as={OutlinedInput}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Toggle password visibility"
                      onClick={handleClickShowPassword}
                      tabIndex="-1"
                    >
                      {visibility ? <VisibilityOff/> : <Visibility/>}
                    </IconButton>
                  </InputAdornment>
                }
                error={errors.password && touched.password}
                label="Password"
                name="password"
                onFocus={focus}
                required
                type={visibility ? 'text' : 'password'}
              />
              {
                errors.password && touched.password
                  ? <FormHelperText className={classes.helperText} error id="username-helper-text">{errors.password}</FormHelperText>
                  : null
              }
            </FormControl>
            {
              isAsten(values['username']) &&
              <ErrorSuspenseWrapper message={intl.formatMessage(messages['error_to_fetch_codes'])} variant="default">
                <CodeAutocomplete
                  setFieldTouched={setFieldTouched}
                  setFieldValue={setFieldValue}
                />
              </ErrorSuspenseWrapper>
            }
            <Box mt={3}>
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
