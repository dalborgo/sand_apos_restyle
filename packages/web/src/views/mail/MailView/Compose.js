import React, { useState } from 'react';
import clsx from 'clsx';
import {
  Backdrop,
  Box,
  Button,
  Divider,
  IconButton,
  Input,
  Paper,
  Portal,
  SvgIcon,
  Tooltip,
  Typography,
  makeStyles,
} from '@material-ui/core';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import AddPhotoIcon from '@material-ui/icons/AddPhotoAlternate';
import {
  X as XIcon,
  Maximize as MaximizeIcon,
  Minimize as MinimizeIcon,
} from 'react-feather';
import QuillEditor from 'src/components/QuillEditor';
import { useDispatch, useSelector } from 'src/store';
import { closeCompose } from 'src/slices/mail';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: `calc(100% - ${theme.spacing(6)}px)`,
    maxHeight: `calc(100% - ${theme.spacing(6)}px)`,
    width: 600,
    position: 'fixed',
    bottom: 0,
    right: 0,
    margin: theme.spacing(3),
    outline: 'none',
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 500,
  },
  fullScreen: {
    height: '100%',
    width: '100%',
  },
  input: {
    width: '100%',
  },
  editor: {
    flexGrow: 1,
    '& .ql-editor': {
      minHeight: 300,
    },
  },
  action: {
    marginRight: theme.spacing(1),
  },
}));

const Compose = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { isComposeOpen } = useSelector((state) => state.mail);
  const [fullScreen, setFullScreen] = useState(false);
  const [messageBody, setMessageBody] = useState('');

  const handleChange = (value) => {
    setMessageBody(value);
  };

  const handleExitFullScreen = () => {
    setFullScreen(false);
  };

  const handleEnterFullScreen = () => {
    setFullScreen(true);
  };

  const handleClose = () => {
    dispatch(closeCompose());
  };

  if (!isComposeOpen) {
    return null;
  }

  return (
    <Portal>
      <Backdrop open={fullScreen} />
      <Paper
        className={
          clsx(
            classes.root,
            { [classes.fullScreen]: fullScreen }
          )
        }
        elevation={12}
      >
        <Box
          alignItems="center"
          bgcolor="background.dark"
          display="flex"
          px={2}
          py={1}
        >
          <Typography
            color="textPrimary"
            variant="h5"
          >
            New Message
          </Typography>
          <Box flexGrow={1} />
          {
            fullScreen ? (
              <IconButton onClick={handleExitFullScreen}>
                <SvgIcon fontSize="small">
                  <MinimizeIcon />
                </SvgIcon>
              </IconButton>
            ) : (
              <IconButton onClick={handleEnterFullScreen}>
                <SvgIcon fontSize="small">
                  <MaximizeIcon />
                </SvgIcon>
              </IconButton>
            )
          }
          <IconButton onClick={handleClose}>
            <SvgIcon fontSize="small">
              <XIcon />
            </SvgIcon>
          </IconButton>
        </Box>
        <Box p={2}>
          <Input
            className={classes.input}
            disableUnderline
            placeholder="To"
          />
          <Input
            className={classes.input}
            disableUnderline
            placeholder="Subject"
          />
        </Box>
        <Divider />
        <QuillEditor
          className={classes.editor}
          onChange={handleChange}
          placeholder="Leave a message"
          value={messageBody}
        />
        <Divider />
        <Box
          alignItems="center"
          display="flex"
          px={2}
          py={1}
        >
          <Button
            className={classes.action}
            color="secondary"
            variant="contained"
          >
            Send
          </Button>
          <Tooltip title="Attach image">
            <IconButton
              className={classes.action}
              size="small"
            >
              <AddPhotoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Attach file">
            <IconButton
              className={classes.action}
              size="small"
            >
              <AttachFileIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </Portal>
  );
};

export default Compose;
