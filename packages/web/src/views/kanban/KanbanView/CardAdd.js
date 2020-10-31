import React, { useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { useSnackbar } from 'notistack'
import { Box, Button, makeStyles, TextField } from '@material-ui/core'
import { useDispatch } from 'src/store'
import { createCard } from 'src/slices/kanban'

const useStyles = makeStyles(() => ({
  root: {},
}))

const CardAdd = ({
  className,
  listId,
  ...rest
}) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const [isExpanded, setExpanded] = useState(false)
  const [name, setName] = useState('')
  
  const handleChange = (event) => {
    event.persist()
    setName(event.target.value)
  }
  
  const handleAddInit = () => {
    setExpanded(true)
  }
  
  const handleAddCancel = () => {
    setExpanded(false)
    setName('')
  }
  
  const handleAddConfirm = async () => {
    try {
      await dispatch(createCard(listId, name || 'Untitled Card'))
      setExpanded(false)
      setName('')
      enqueueSnackbar('Card created', {
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
      {
        isExpanded ?
          (
            <>
              <TextField
                fullWidth
                label="Card Title"
                name="cardName"
                onChange={handleChange}
                value={name}
                variant="outlined"
              />
              <Box
                display="flex"
                justifyContent="space-between"
                mt={2}
              >
                <Button
                  onClick={handleAddCancel}
                  variant="text"
                >
                  Cancel
                </Button>
                <Button
                  color="secondary"
                  onClick={handleAddConfirm}
                  variant="contained"
                >
                  Add
                </Button>
              </Box>
            </>
          )
          :
          (
            <Box
              display="flex"
              justifyContent="center"
            >
              <Button onClick={handleAddInit}>
                Add another card
              </Button>
            </Box>
          )
      }
    </div>
  )
}

CardAdd.propTypes = {
  className: PropTypes.string,
  listId: PropTypes.string.isRequired,
}

export default CardAdd
