import React, { useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { useSnackbar } from 'notistack'
import { Box, Button, Checkbox, IconButton, makeStyles, SvgIcon, TextField, Typography } from '@material-ui/core'
import { Trash as TrashIcon } from 'react-feather'
import { useDispatch } from 'src/store'
import { deleteCheckItem, updateCheckItem } from 'src/slices/kanban'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'flex-start',
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: theme.palette.background.dark,
      '& $deleteButton': {
        visibility: 'visible',
      },
    },
  },
  checkbox: {
    marginLeft: theme.spacing(-1),
    marginRight: theme.spacing(1),
  },
  name: {
    flexGrow: 1,
    cursor: 'pointer',
    minHeight: 32,
  },
  deleteButton: {
    visibility: 'hidden',
  },
}))

const CheckItem = ({
  card,
  checklist,
  checkItem,
  className,
  editing,
  onEditCancel,
  onEditInit,
  onEditComplete,
  ...rest
}) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const [name, setName] = useState(checkItem.name)
  
  const handleStateChange = async (event) => {
    try {
      event.persist()
      
      const state = event.target.checked ? 'complete' : 'incomplete'
      
      await dispatch(updateCheckItem(
        card.id,
        checklist.id,
        checkItem.id,
        { state }
      ))
      enqueueSnackbar('Check item updated', {
        variant: 'success',
      })
    } catch (err) {
      
      enqueueSnackbar('Something went wrong')
    }
  }
  
  const handleNameChange = (event) => {
    event.persist()
    setName(event.target.value)
  }
  
  const handleSave = async () => {
    try {
      await dispatch(updateCheckItem(
        card.id,
        checklist.id,
        checkItem.id,
        { name }
      ))
      onEditComplete()
      enqueueSnackbar('Check item updated', {
        variant: 'success',
      })
    } catch (err) {
      
      enqueueSnackbar('Something went wrong')
    }
  }
  
  const handleCancel = () => {
    setName(checkItem.name)
    onEditCancel()
  }
  
  const handleDelete = async () => {
    try {
      await dispatch(deleteCheckItem(
        card.id,
        checklist.id,
        checkItem.id
      ))
      enqueueSnackbar('Check item deleted', {
        variant: 'success',
      })
    } catch (err) {
      
      enqueueSnackbar('Something went wrong')
    }
  }
  
  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Checkbox
        checked={checkItem.state === 'complete'}
        className={classes.checkbox}
        onChange={handleStateChange}
      />
      {
        editing ?
          (
            <Box flexGrow={1}>
              <TextField
                fullWidth
                onChange={handleNameChange}
                value={name}
                variant="outlined"
              />
              <Box mt={1}>
                <Button
                  color="secondary"
                  onClick={handleSave}
                  size="small"
                  variant="contained"
                >
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  size="small"
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )
          :
          (
            <Box
              alignItems="center"
              display="flex"
              flexGrow={1}
            >
              <Typography
                className={classes.name}
                color="textPrimary"
                onClick={onEditInit}
                variant="body1"
              >
                {checkItem.name}
              </Typography>
              <IconButton
                className={classes.deleteButton}
                onClick={handleDelete}
              >
                <SvgIcon fontSize="small">
                  <TrashIcon/>
                </SvgIcon>
              </IconButton>
            </Box>
          )
      }
    </div>
  )
}

CheckItem.propTypes = {
  card: PropTypes.object.isRequired,
  checkItem: PropTypes.object.isRequired,
  checklist: PropTypes.object.isRequired,
  className: PropTypes.string,
  editing: PropTypes.bool,
  onEditCancel: PropTypes.func,
  onEditComplete: PropTypes.func,
  onEditInit: PropTypes.func,
}

CheckItem.defaultProps = {
  editing: false,
  onEditCancel: () => {},
  onEditComplete: () => {},
  onEditInit: () => {},
}

export default CheckItem
