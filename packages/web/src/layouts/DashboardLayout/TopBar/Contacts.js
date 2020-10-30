import React, { useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import moment from 'moment'
import {
  Avatar,
  Box,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Popover,
  SvgIcon,
  Tooltip,
  Typography,
} from '@material-ui/core'
import { Users as UsersIcon } from 'react-feather'
import { useDispatch, useSelector } from 'src/store'
import { getContacts } from 'src/slices/chat'
import OnlineIndicator from 'src/components/OnlineIndicator'

const useStyles = makeStyles((theme) => ({
  popover: {
    width: 320,
    padding: theme.spacing(2),
  },
  list: {
    padding: theme.spacing(1, 3),
  },
  listItemText: {
    marginRight: theme.spacing(1),
  },
  lastActivity: {
    whiteSpace: 'nowrap',
  },
}))

const Contacts = () => {
  const classes = useStyles()
  const ref = useRef(null)
  const dispatch = useDispatch()
  const { contacts } = useSelector((state) => state.chat)
  const [isOpen, setOpen] = useState(false)
  
  const handleOpen = () => {
    setOpen(true)
  }
  
  const handleClose = () => {
    setOpen(false)
  }
  
  useEffect(() => {
    dispatch(getContacts())
  }, [dispatch])
  
  return (
    <>
      <Tooltip title="Contacts">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          ref={ref}
        >
          <SvgIcon fontSize="small">
            <UsersIcon/>
          </SvgIcon>
        </IconButton>
      </Tooltip>
      <Popover
        anchorEl={ref.current}
        anchorOrigin={
          {
            vertical: 'bottom',
            horizontal: 'center',
          }
        }
        classes={{ paper: classes.popover }}
        onClose={handleClose}
        open={isOpen}
      >
        
        <Typography
          color="textPrimary"
          variant="h4"
        >
          Contacts
        </Typography>
        <Box mt={2}>
          <List disablePadding>
            {
              contacts.allIds.map((contactId) => {
                const contact = contacts.byId[contactId]
                
                return (
                  <ListItem
                    disableGutters
                    key={contact.id}
                  >
                    <ListItemAvatar>
                      <Avatar
                        alt="Person"
                        src={contact.avatar}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      className={classes.listItemText}
                      disableTypography
                      primary={
                        (
                          <Link
                            color="textPrimary"
                            component={RouterLink}
                            display="block"
                            noWrap
                            to="#"
                            underline="none"
                            variant="h6"
                          >
                            {contact.name}
                          </Link>
                        )
                      }
                    />
                    {
                      contact.isActive ?
                        (
                          <OnlineIndicator
                            size="small"
                            status="online"
                          />
                        ) :
                        (
                          <Typography
                            color="textSecondary"
                            noWrap
                            variant="caption"
                          >
                            {moment(contact.lastActivity).fromNow()}
                          </Typography>
                        )
                    }
                  </ListItem>
                )
              })
            }
          </List>
        </Box>
      </Popover>
    </>
  )
}

export default Contacts
