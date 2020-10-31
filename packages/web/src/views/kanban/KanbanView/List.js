import React, { useRef, useState } from 'react'
import clsx from 'clsx'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { Draggable, Droppable } from 'react-beautiful-dnd'
import {
  Box,
  ClickAwayListener,
  Divider,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Paper,
  SvgIcon,
  TextField,
  Typography,
} from '@material-ui/core'
import { MoreVertical as MoreIcon } from 'react-feather'
import { useDispatch, useSelector } from 'src/store'
import { clearList, deleteList, updateList } from 'src/slices/kanban'
import Card from './Card'
import CardAdd from './CardAdd'
import log from '@adapter/common/src/log'

const listSelector = (state, listId) => {
  const { lists } = state.kanban
  return lists.byId[listId]
}

const useStyles = makeStyles((theme) => ({
  root: {},
  inner: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
    overflowY: 'hidden',
    overflowX: 'hidden',
    width: 380,
    [theme.breakpoints.down('xs')]: {
      width: 300,
    },
  },
  title: {
    cursor: 'pointer',
  },
  droppableArea: {
    minHeight: 80,
    flexGrow: 1,
    overflowY: 'auto',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  menu: {
    width: 240,
  },
}))

const List = ({ className, listId, ...rest }) => {
  const classes = useStyles()
  const [isMenuOpen, setMenuOpen] = useState(false)
  const list = useSelector((state) => listSelector(state, listId))
  const dispatch = useDispatch()
  const moreRef = useRef(null)
  const { enqueueSnackbar } = useSnackbar()
  const [name, setName] = useState(list.name)
  const [isRenaming, setRenaming] = useState(false)
  
  const handleMenuOpen = () => {
    setMenuOpen(true)
  }
  
  const handleMenuClose = () => {
    setMenuOpen(false)
  }
  
  const handleChange = (event) => {
    event.persist()
    setName(event.target.value)
  }
  
  const handleRenameInit = () => {
    setRenaming(true)
    setMenuOpen(false)
  }
  
  const handleRename = async () => {
    try {
      if (!name) {
        setName(list.name)
        setRenaming(false)
        return
      }
      
      const update = { name }
      
      setRenaming(false)
      await dispatch(updateList(list.id, update))
      enqueueSnackbar('List updated', {
        variant: 'success',
      })
    } catch (err) {
      log.error(err)
      enqueueSnackbar('Something went wrong')
    }
  }
  
  const handleDelete = async () => {
    try {
      setMenuOpen(false)
      await dispatch(deleteList(list.id))
      enqueueSnackbar('List deleted', {
        variant: 'success',
      })
    } catch (err) {
      log.error(err)
      enqueueSnackbar('Something went wrong')
    }
  }
  
  const handleClear = async () => {
    try {
      setMenuOpen(false)
      await dispatch(clearList(list.id))
      enqueueSnackbar('List cleared', {
        variant: 'success',
      })
    } catch (err) {
      log.error(err)
      enqueueSnackbar('Something went wrong')
    }
  }
  
  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Paper className={classes.inner}>
        <Box
          alignItems="center"
          display="flex"
          px={2}
          py={1}
        >
          {
            isRenaming ? 
              (
                <ClickAwayListener onClickAway={handleRename}>
                  <TextField
                    margin="dense"
                    onBlur={handleRename}
                    onChange={handleChange}
                    value={name}
                    variant="outlined"
                  />
                </ClickAwayListener>
              ) : 
              (
                <Typography
                  color="inherit"
                  onClick={handleRenameInit}
                  variant="h5"
                >
                  {list.name}
                </Typography>
              )
          }
          <Box flexGrow={1}/>
          <IconButton
            color="inherit"
            edge="end"
            onClick={handleMenuOpen}
            ref={moreRef}
          >
            <SvgIcon fontSize="small">
              <MoreIcon/>
            </SvgIcon>
          </IconButton>
        </Box>
        <Divider/>
        <Droppable
          droppableId={list.id}
          type="card"
        >
          {
            (provided) => (
              <div
                className={classes.droppableArea}
                ref={provided.innerRef}
              >
                {
                  list.cardIds.map((cardId, index) => (
                    <Draggable
                      draggableId={cardId}
                      index={index}
                      key={cardId}
                    >
                      {
                        (provided, snapshot) => (
                          <Card
                            cardId={cardId}
                            dragging={snapshot.isDragging}
                            index={index}
                            key={cardId}
                            list={list}
                            ref={provided.innerRef}
                            style={{ ...provided.draggableProps.style }}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          />
                        )
                      }
                    </Draggable>
                  ))
                }
                {provided.placeholder}
              </div>
            )
          }
        </Droppable>
        <Divider/>
        <Box p={2}>
          <CardAdd listId={list.id}/>
        </Box>
        <Menu
          anchorEl={moreRef.current}
          anchorOrigin={
            {
              vertical: 'bottom',
              horizontal: 'center',
            }
          }
          getContentAnchorEl={null}
          keepMounted
          onClose={handleMenuClose}
          open={isMenuOpen}
          PaperProps={{ className: classes.menu }}
        >
          <MenuItem onClick={handleRenameInit}>
            Rename
          </MenuItem>
          <MenuItem onClick={handleClear}>
            Clear
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            Delete
          </MenuItem>
        </Menu>
      </Paper>
    </div>
  )
}

List.propTypes = {
  className: PropTypes.string,
  listId: PropTypes.string.isRequired,
}

export default List
