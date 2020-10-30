import React, { useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  IconButton,
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
import {
  Bell as BellIcon,
  MessageCircle as MessageIcon,
  Package as PackageIcon,
  Truck as TruckIcon,
} from 'react-feather'
import { useDispatch, useSelector } from 'src/store'
import { getNotifications } from 'src/slices/notification'

const iconsMap = {
  order_placed: PackageIcon,
  new_message: MessageIcon,
  item_shipped: TruckIcon,
};

const useStyles = makeStyles((theme) => ({
  popover: {
    width: 320,
  },
  icon: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
}));

const Notifications = () => {
  const classes = useStyles();
  const { notifications } = useSelector((state) => state.notifications);
  const ref = useRef(null);
  const dispatch = useDispatch();
  const [isOpen, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          ref={ref}
        >
          <SvgIcon>
            <BellIcon />
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
        <Box p={2}>
          <Typography
            color="textPrimary"
            variant="h5"
          >
            Notifications
          </Typography>
        </Box>
        {
          notifications.length === 0 ? (
            <Box p={2}>
              <Typography
                color="textPrimary"
                variant="h6"
              >
              There are no notifications
              </Typography>
            </Box>
          ) : (
            <>
              <List disablePadding>
                {
                  notifications.map((notification) => {
                    const Icon = iconsMap[notification.type];

                    return (
                      <ListItem
                        component={RouterLink}
                        divider
                        key={notification.id}
                        to="#"
                      >
                        <ListItemAvatar>
                          <Avatar
                            className={classes.icon}
                          >
                            <SvgIcon fontSize="small">
                              <Icon />
                            </SvgIcon>
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={notification.title}
                          primaryTypographyProps={{ variant: 'subtitle2', color: 'textPrimary' }}
                          secondary={notification.description}
                        />
                      </ListItem>
                    );
                  })
                }
              </List>
              <Box
                display="flex"
                justifyContent="center"
                p={1}
              >
                <Button
                  component={RouterLink}
                  size="small"
                  to="#"
                >
                Mark all as read
                </Button>
              </Box>
            </>
          )
        }
      </Popover>
    </>
  );
};

export default Notifications;
