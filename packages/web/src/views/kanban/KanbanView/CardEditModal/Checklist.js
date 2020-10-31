import React, { useState } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { useSnackbar } from 'notistack'
import { Box, Button, LinearProgress, makeStyles, SvgIcon, TextField, Typography } from '@material-ui/core'
import { List as ListIcon } from 'react-feather'
import { useDispatch } from 'src/store'
import { deleteChecklist, updateChecklist } from 'src/slices/kanban'
import CheckItem from './CheckItem'
import CheckItemAdd from './CheckItemAdd'

const useStyles = makeStyles((theme) => ({
  root: {},
  listIcon: {
    marginRight: theme.spacing(3),
  },
}))

const Checklist = ({
  card,
  checklist,
  className,
  ...rest
}) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const [name, setName] = useState(checklist.name)
  const [editingName, setEditingName] = useState(false)
  const [editingCheckItem, setEditingCheckItem] = useState(null)
  
  const handleNameEdit = () => {
    setEditingName(true)
  }
  
  const handleNameChange = (event) => {
    event.persist()
    setName(event.target.value)
  }
  
  const handleNameSave = async () => {
    try {
      if (!name || name === checklist.name) {
        setEditingName(false)
        setName(checklist.name)
        return
      }
      
      setEditingName(false)
      await dispatch(updateChecklist(card.id, checklist.id, { name }))
      enqueueSnackbar('Checklist updated', {
        variant: 'success',
      })
    } catch (err) {
      
      enqueueSnackbar('Something went wrong')
    }
  }
  
  const handleNameCancel = () => {
    setEditingName(false)
    setName(checklist.name)
  }
  
  const handleDelete = async () => {
    try {
      await dispatch(deleteChecklist(card.id, checklist.id))
      enqueueSnackbar('Checklist deleted', {
        variant: 'success',
      })
    } catch (err) {
      
      enqueueSnackbar('Something went wrong')
    }
  }
  
  const handleCheckItemEditInit = (checkItemId) => {
    setEditingCheckItem(checkItemId)
  }
  
  const handleCheckItemEditCancel = () => {
    setEditingCheckItem(null)
  }
  
  const handleCheckItemEditComplete = () => {
    setEditingCheckItem(null)
  }
  
  const totalCheckItems = checklist.checkItems.length
  const completedCheckItems = (checklist.checkItems.filter((checkItem) => checkItem.state === 'complete')).length
  const completePercentage = totalCheckItems === 0
    ? 100
    : (completedCheckItems / totalCheckItems) * 100
  
  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Box
        display="flex"
      >
        <SvgIcon
          className={classes.listIcon}
          color="action"
          fontSize="small"
        >
          <ListIcon/>
        </SvgIcon>
        {
          editingName ?
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
                    color="primary"
                    onClick={handleNameSave}
                    size="small"
                    variant="contained"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={handleNameCancel}
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
                  color="textPrimary"
                  onClick={handleNameEdit}
                  variant="h4"
                >
                  {checklist.name}
                </Typography>
                <Box flexGrow={1}/>
                <Button
                  onClick={handleDelete}
                  size="small"
                >
                  Delete
                </Button>
              </Box>
            )
        }
      </Box>
      <Box
        alignItems="center"
        display="flex"
        mt={1}
      >
        <Typography
          color="textSecondary"
          variant="caption"
        >
          {Math.round(completePercentage)}
          %
        </Typography>
        <Box
          flexGrow={1}
          ml={2}
        >
          <LinearProgress
            color="secondary"
            value={completePercentage}
            variant="determinate"
          />
        </Box>
      </Box>
      <Box mt={3}>
        {
          checklist.checkItems.map((checkItem) => (
            <CheckItem
              card={card}
              checkItem={checkItem}
              checklist={checklist}
              editing={editingCheckItem === checkItem.id}
              key={checkItem.id}
              onEditCancel={handleCheckItemEditCancel}
              onEditComplete={handleCheckItemEditComplete}
              onEditInit={() => handleCheckItemEditInit(checkItem.id)}
            />
          ))
        }
      </Box>
      <Box
        ml={6}
        mt={1}
      >
        <CheckItemAdd
          card={card}
          checklist={checklist}
        />
      </Box>
    </div>
  )
}

Checklist.propTypes = {
  card: PropTypes.object.isRequired,
  checklist: PropTypes.object.isRequired,
  className: PropTypes.string,
}

export default Checklist
