import React, { useState } from 'react'
import PropTypes from 'prop-types'
import * as Yup from 'yup'
import { Field, reduxForm, SubmissionError } from 'redux-form'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Divider,
  FormHelperText,
  Grid,
  Link,
  TextField,
  Typography,
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import wait from 'src/utils/wait'

const validationSchema = Yup.object().shape({
  email: Yup.string().email().required('Required'),
  firstName: Yup.string().required('Required'),
  lastName: Yup.string().required('Required'),
  password: Yup.string().min(7, 'Must be at least 7 characters').max(255).required('Required'),
  policy: Yup.boolean().oneOf([true], 'This field must be checked'),
})

const validate = (values) => {
  const formErrors = {}
  
  try {
    validationSchema.validateSync(values, { abortEarly: false })
  } catch (errors) {
    errors.inner.forEach((error) => {
      formErrors[error.path] = error.message
    })
  }
  
  return formErrors
}

const submit = async () => {
  try {
    // NOTE: Make API request
    await wait(1000)
  } catch (err) {
    
    throw new SubmissionError({
      _error: 'Login failed!',
    })
  }
}

const renderTextField = ({
  input,
  label,
  meta: { touched, invalid, error },
  ...rest
}) => {
  return (
    <TextField
      error={touched && invalid}
      fullWidth
      helperText={touched && error}
      label={label}
      variant="outlined"
      {...input}
      {...rest}
    />
  )
}

const renderCheckbox = ({
  input,
  label,
  meta: { touched, invalid, error },
  ...rest
}) => {
  return (
    <div>
      <Box
        alignItems="center"
        display="flex"
        ml={-1}
      >
        <Checkbox
          checked={!!input.value}
          onChange={input.onChange}
          {...input}
          {...rest}
        />
        {label}
      </Box>
      {
        Boolean(touched && invalid) && (
          <FormHelperText error>
            {error}
          </FormHelperText>
        )
      }
    </div>
  )
}

const BasicForm = ({ handleSubmit, submitting }) => {
  const [isAlertVisible, setAlertVisible] = useState(true)
  
  return (
    <form onSubmit={handleSubmit(submit)}>
      <Card>
        <CardHeader title="Basic Form"/>
        <Divider/>
        <CardContent>
          {
            isAlertVisible && (
              <Box mb={3}>
                <Alert
                  onClose={() => setAlertVisible(false)}
                  severity="info"
                >
                  This is an info alert - check it out!
                </Alert>
              </Box>
            )
          }
          {
            (submitting) ?
              (
                <Box
                  display="flex"
                  justifyContent="center"
                  my={5}
                >
                  <CircularProgress/>
                </Box>
              ) :
              (
                <>
                  <Grid
                    container
                    spacing={2}
                  >
                    <Grid
                      item
                      md={6}
                      xs={12}
                    >
                      <Field
                        component={renderTextField}
                        label="First Name"
                        name="firstName"
                      />
                    </Grid>
                    <Grid
                      item
                      md={6}
                      xs={12}
                    >
                      <Field
                        component={renderTextField}
                        label="Last Name"
                        name="lastName"
                      />
                    </Grid>
                  </Grid>
                  <Box mt={2}>
                    <Field
                      component={renderTextField}
                      label="Email Address"
                      name="email"
                      type="email"
                    />
                  </Box>
                  <Box mt={2}>
                    <Field
                      component={renderTextField}
                      label="Password"
                      name="password"
                      type="password"
                    />
                  </Box>
                  <Box mt={2}>
                    <Field
                      component={renderCheckbox}
                      label={
                        (
                          <Typography
                            color="textSecondary"
                            variant="body2"
                          >
                            I have read the
                            {' '}
                            <Link
                              color="secondary"
                              component="a"
                              href="#"
                            >
                              Terms and Conditions
                            </Link>
                          </Typography>
                        )
                      }
                      name="policy"
                    />
                  </Box>
                  <Box mt={2}>
                    <Button
                      color="secondary"
                      disabled={submitting}
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                    >
                      Sign up
                    </Button>
                  </Box>
                </>
              )
          }
        </CardContent>
      </Card>
    </form>
  )
}

BasicForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
}

export default reduxForm({
  form: 'BasicForm',
  validate,
  initialValues: {
    email: 'johnnydoe@yahoo.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'thisisasecuredpassword',
    policy: false,
  },
})(BasicForm)
