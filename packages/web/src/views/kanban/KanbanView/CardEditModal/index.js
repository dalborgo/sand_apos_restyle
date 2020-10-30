import React from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import {
  Box,
  Dialog,
  Divider,
  Grid,
  Typography,
  makeStyles,
  IconButton,
  SvgIcon,
} from '@material-ui/core';
import {
  XCircle as CloseIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  ArrowRight as ArrowRightIcon,
  Archive as ArchiveIcon,
  CheckSquare as CheckIcon,
  Copy as CopyIcon,
  Users as UsersIcon,
  File as FileIcon,
  Layout as LayoutIcon,
} from 'react-feather';
import { useDispatch } from 'src/store';
import {
  deleteCard,
  updateCard,
  addChecklist,
} from 'src/slices/kanban';
import Details from './Details';
import Checklist from './Checklist';
import Comment from './Comment';
import CommentAdd from './CommentAdd';
import ActionButton from './ActionButton';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  listName: {
    fontWeight: theme.typography.fontWeightMedium,
  },
  checklist: {
    '& + &': {
      marginTop: theme.spacing(3),
    },
  },
}));

const CardEditModal = ({
  card,
  className,
  list,
  onClose,
  open,
  ...rest
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubscribe = async () => {
    try {
      await dispatch(updateCard(card.id, { isSubscribed: true }));
      enqueueSnackbar('Unsubscribed', {
        variant: 'success',
      });
    } catch (err) {
      
      enqueueSnackbar('Something went wrong', {
        variant: 'error',
      });
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await dispatch(updateCard(card.id, { isSubscribed: false }));
      enqueueSnackbar('Subscribed', {
        variant: 'success',
      });
    } catch (err) {
      
      enqueueSnackbar('Something went wrong', {
        variant: 'error',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteCard(card.id));
      enqueueSnackbar('Card archived', {
        variant: 'success',
      });
    } catch (err) {
      
      enqueueSnackbar('Something went wrong', {
        variant: 'error',
      });
    }
  };

  const handleAddChecklist = async () => {
    try {
      await dispatch(addChecklist(card.id, 'Untitled Checklist'));
      enqueueSnackbar('Checklist added', {
        variant: 'success',
      });
    } catch (err) {
      
      enqueueSnackbar('Something went wrong', {
        variant: 'error',
      });
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      onClose={onClose}
      open={open}
      {...rest}
    >
      <div className={classes.root}>
        <Box
          display="flex"
          justifyContent="space-between"
        >
          <Typography
            color="textSecondary"
            variant="body2"
          >
            in list
            {' '}
            <span className={classes.listName}>
              {list.name}
            </span>
          </Typography>
          <IconButton onClick={onClose}>
            <SvgIcon>
              <CloseIcon />
            </SvgIcon>
          </IconButton>
        </Box>
        <Grid
          container
          spacing={5}
        >
          <Grid
            item
            sm={8}
            xs={12}
          >
            <Details
              card={card}
              list={list}
            />
            {
              card.checklists.length > 0 && (
                <Box mt={5}>
                  {
                    card.checklists.map((checklist) => (
                      <Checklist
                        card={card}
                        checklist={checklist}
                        className={classes.checklist}
                        key={checklist.id}
                      />
                    ))
                  }
                </Box>
              )
            }
            <Box mt={3}>
              <Typography
                color="textPrimary"
                variant="h4"
              >
                Activity
              </Typography>
              <Box mt={2}>
                <CommentAdd cardId={card.id} />
                {
                  card.comments.length > 0 && (
                    <Box mt={3}>
                      {
                        card.comments.map((comment) => (
                          <Comment
                            comment={comment}
                            key={comment.id}
                          />
                        ))
                      }
                    </Box>
                  )
                }
              </Box>
            </Box>
          </Grid>
          <Grid
            item
            sm={4}
            xs={12}
          >
            <Typography
              color="textSecondary"
              variant="overline"
            >
              Add to card
            </Typography>
            <ActionButton
              icon={<CheckIcon />}
              onClick={handleAddChecklist}
            >
              Checklist
            </ActionButton>
            <ActionButton
              disabled
              icon={<UsersIcon />}
            >
              Members
            </ActionButton>
            <ActionButton
              disabled
              icon={<UsersIcon />}
            >
              Labels
            </ActionButton>
            <ActionButton
              disabled
              icon={<FileIcon />}
            >
              Attachments
            </ActionButton>
            <Box mt={3}>
              <Typography
                color="textSecondary"
                variant="overline"
              >
                Actions
              </Typography>
              <ActionButton
                disabled
                icon={<ArrowRightIcon />}
              >
                Move
              </ActionButton>
              <ActionButton
                disabled
                icon={<CopyIcon />}
              >
                Copy
              </ActionButton>
              <ActionButton
                disabled
                icon={<LayoutIcon />}
              >
                Make Template
              </ActionButton>
              {
                card.isSubscribed ? 
                  (
                    <ActionButton
                      icon={<EyeOffIcon />}
                      onClick={handleUnsubscribe}
                    >
                  Unwatch
                    </ActionButton>
                  ) 
                  : 
                  (
                    <ActionButton
                      icon={<EyeIcon />}
                      onClick={handleSubscribe}
                    >
                  Watch
                    </ActionButton>
                  )
              }
              <Divider />
              <ActionButton
                icon={<ArchiveIcon />}
                onClick={handleDelete}
              >
                Archive
              </ActionButton>
            </Box>
          </Grid>
        </Grid>
      </div>
    </Dialog>
  );
};

CardEditModal.propTypes = {
  card: PropTypes.object.isRequired,
  className: PropTypes.string,
  list: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

CardEditModal.defaultProps = {
  open: false,
  onClose: () => {},
};

export default CardEditModal;
