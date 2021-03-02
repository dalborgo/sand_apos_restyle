import React, { useCallback } from 'react'
import clsx from 'clsx'
import { useDropzone } from 'react-dropzone'
import { colors, makeStyles, Typography } from '@material-ui/core'
import { useSnackbar } from 'notistack'
import bytesToSize from 'src/utils/bytesToSize'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'

const useStyles = makeStyles(theme => ({
  dropZone: {
    border: `1px dashed ${theme.palette.divider}`,
    padding: theme.spacing(6),
    outline: 'none',
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    alignItems: 'center',
    '&:hover': {
      backgroundColor: colors.grey[50],
      opacity: 0.5,
      cursor: 'pointer',
    },
  },
  dragActive: {
    backgroundColor: colors.grey[50],
    opacity: 0.5,
  },
  image: {
    width: 130,
  },
  info: {
    marginTop: theme.spacing(1),
  },
  list: {
    maxHeight: 320,
  },
  actions: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'flex-end',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },
}))

const FilesDropzone = props => {
  const { handleUpload } = props
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()
  const intl = useIntl()
  const onDropRejected = useCallback(rejectedFiles => {
    const [result] = rejectedFiles
    const { file, errors } = result
    for (let error of errors) {
      const message = messages[`dropzone_${error.code}`] ?
        intl.formatMessage(messages[`dropzone_${error.code}`], {
          name: file.name,
          size: bytesToSize(file.size),
          type: file.type,
        })
        :
        error.message
      enqueueSnackbar(message)
    }
  }, [enqueueSnackbar, intl])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: '.csv',
    multiple: false,
    maxSize: 5242880,
    onDrop: handleUpload,
    onDropRejected,
  })
  
  return (
    <div
      className={
        clsx({
          [classes.dropZone]: true,
          [classes.dragActive]: isDragActive,
        })
      }
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <div>
        <img
          alt=""
          className={classes.image}
          src="/static/images/undraw_add_file2_gvbb.svg"
        />
      </div>
      <div>
        <Typography
          gutterBottom
          variant="h3"
        >
          <FormattedMessage defaultMessage="Scegli il file" id="dropzone.select_file"/>
        </Typography>
        <Typography
          className={classes.info}
          color="textSecondary"
          variant="body1"
        >
          Trascinalo qui o clicca per selezionarlo dalle cartelle.
        </Typography>
      </div>
    </div>
  )
}

export default FilesDropzone

