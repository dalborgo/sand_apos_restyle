import React, { memo } from 'react'
import { DialogContent, ListItem, ListItemText, makeStyles, Typography } from '@material-ui/core'
import { messages } from 'src/translations/messages'
import { useIntl } from 'react-intl'
import clsx from 'clsx'

const useStyles = makeStyles(theme => ({
  errorIcon: {
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
  listItemText: {
    marginRight: theme.spacing(2),
  },
  listItemRed: {
    color: theme.palette.error.main,
  },
  dialogContent: {
    padding: theme.spacing(1.5, 1),
  },
  content: {
    overflow: 'auto',
    minWidth: 500,
  },
  typoCaption: {
    whiteSpace: 'nowrap',
  },
}))
const StatusReport = ({ data }) => {
  const intl = useIntl()
  const classes = useStyles()
  return (
    <>
      <DialogContent className={classes.dialogContent} dividers>
        <div className={classes.content}>
          {
            data.map(({ updateResult, description, status }, index) =>
              (
                <ListItem
                  classes={
                    {
                      divider: classes.divider,
                    }
                  }
                  dense
                  divider={index < data.length - 1}
                  key={index}
                >
                  <ListItemText
                    className={clsx(classes.listItemText,{[classes.listItemRed]: updateResult !== '1' })}
                    primary={
                      intl.formatMessage(messages[`management_hotel_status_${updateResult}`])
                    }
                  />
                  <Typography className={classes.typoCaption} variant="caption">
                    {description}&nbsp; ({intl.formatMessage(messages[`management_hotel_status_${status}`])})
                  </Typography>
                </ListItem>
              )
            )
          }
        </div>
      </DialogContent>
    </>
  )
}

export default memo(StatusReport)

