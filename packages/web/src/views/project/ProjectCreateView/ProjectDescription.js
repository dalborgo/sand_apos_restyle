import React, { useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { Box, Button, FormHelperText, makeStyles, Paper, Typography } from '@material-ui/core'
import QuillEditor from 'src/components/QuillEditor'

const useStyles = makeStyles((theme) => ({
  root: {},
  editorContainer: {
    marginTop: theme.spacing(3),
  },
  editor: {
    '& .ql-editor': {
      height: 400,
    },
  },
}))

const ProjectDescription = ({
  className,
  onBack,
  onComplete,
  ...rest
}) => {
  const classes = useStyles()
  const [content, setContent] = useState('')
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  
  const handleChange = (value) => {
    setContent(value)
  }
  
  const handleSubmit = async (event) => {
    event.preventDefault()
    
    try {
      setSubmitting(true)
      
      // NOTE: Make API request
      
      if (onComplete) {
        onComplete()
      }
    } catch (err) {
      
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <form
      className={clsx(classes.root, className)}
      onSubmit={handleSubmit}
      {...rest}
    >
      <Typography
        color="textPrimary"
        variant="h3"
      >
        Please select one option
      </Typography>
      <Box mt={2}>
        <Typography
          color="textSecondary"
          variant="subtitle1"
        >
          Proin tincidunt lacus sed ante efficitur efficitur.
          Quisque aliquam fringilla velit sit amet euismod.
        </Typography>
      </Box>
      <Paper
        className={classes.editorContainer}
        variant="outlined"
      >
        <QuillEditor
          className={classes.editor}
          handleChange={handleChange}
          value={content}
        />
      </Paper>
      {
        error && (
          <Box mt={2}>
            <FormHelperText error>
              {FormHelperText}
            </FormHelperText>
          </Box>
        )
      }
      <Box
        display="flex"
        mt={6}
      >
        {
          onBack && (
            <Button
              onClick={onBack}
              size="large"
            >
              Previous
            </Button>
          )
        }
        <Box flexGrow={1}/>
        <Button
          color="secondary"
          disabled={isSubmitting}
          size="large"
          type="submit"
          variant="contained"
        >
          Complete
        </Button>
      </Box>
    </form>
  )
}

ProjectDescription.propTypes = {
  className: PropTypes.string,
  onBack: PropTypes.func,
  onComplete: PropTypes.func,
}

ProjectDescription.defaultProps = {
  onComplete: () => {},
  onBack: () => {},
}

export default ProjectDescription
