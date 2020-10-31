import React, { useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { useSnackbar } from 'notistack'
import { Box, Button, Card, makeStyles, TextField } from '@material-ui/core'
import { useDispatch } from 'src/store'
import { createList } from 'src/slices/kanban'

const useStyles = makeStyles((theme) => ({
  root: {},
  inner: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 380,
    [theme.breakpoints.down('xs')]: {
      width: 300,
    },
  },
}))

const ListAdd = ({ className, ...rest }) => {
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
      await dispatch(createList(name || 'Untitled list'))
      setExpanded(false)
      setName('')
      enqueueSnackbar('List created', {
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
      <Card className={classes.inner}>
        <Box p={2}>
          {
            isExpanded ?
              (
                <>
                  <TextField
                    fullWidth
                    label="List Title"
                    name="listName"
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
                    Add another list
                  </Button>
                </Box>
              )
          }
        </Box>
      </Card>
    </div>
  )
}

ListAdd.propTypes = {
  className: PropTypes.string,
}

export default ListAdd
