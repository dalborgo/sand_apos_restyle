import React, { useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  TextField,
  Typography,
  makeStyles,
} from '@material-ui/core';
import getInitials from 'src/utils/getInitials';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  helperText: {
    textAlign: 'right',
    marginRight: 0,
  },
}));

const ApplyModal = ({
  author,
  className,
  onApply,
  onClose,
  open,
  ...rest
}) => {
  const classes = useStyles();
  const [value, setValue] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (event) => {
    event.persist();
    setValue(event.target.value);
  };

  const handleApply = () => {
    enqueueSnackbar('Request sent', {
      variant: 'success',
    });
    onApply();
  };

  return (
    <Dialog
      maxWidth="lg"
      onClose={onClose}
      open={open}
    >
      <div
        className={clsx(classes.root, className)}
        {...rest}
      >
        <Typography
          align="center"
          color="textPrimary"
          gutterBottom
          variant="h3"
        >
          The project requires an introduction
        </Typography>
        <Typography
          align="center"
          color="textSecondary"
          variant="subtitle2"
        >
          Write down a short note with your application regarding why you
          think you&apos;d be a good fit for this position.
        </Typography>
        <Box mt={3}>
          <TextField
            autoFocus
            FormHelperTextProps={{ classes: { root: classes.helperText } }}
            fullWidth
            helperText={`${200 - value.length} characters left`}
            label="Short Note"
            multiline
            onChange={handleChange}
            placeholder="What excites you about this project?"
            rows={5}
            value={value}
            variant="outlined"
          />
          <Box
            alignItems="center"
            display="flex"
            mt={6}
          >
            <Avatar
              alt="Author"
              src={author.avatar}
            >
              {getInitials(author.name)}
            </Avatar>
            <Box ml={2}>
              <Typography
                color="textPrimary"
                variant="h3"
              >
                {author.name}
              </Typography>
              <Typography
                color="textPrimary"
                variant="subtitle2"
              >
                {/* {author.bio} */}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          mt={3}
          p={3}
        >
          <Button
            color="primary"
            fullWidth
            onClick={handleApply}
            variant="contained"
          >
            Apply for a role
          </Button>
        </Box>
      </div>
    </Dialog>
  );
};

ApplyModal.propTypes = {
  author: PropTypes.object.isRequired,
  className: PropTypes.string,
  onApply: PropTypes.func,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
};

ApplyModal.defaultProps = {
  onApply: () => {},
  onClose: () => {},
};

export default ApplyModal;
