import React, { memo } from 'react'
import { DialogContent, ListItem, ListItemText, makeStyles, Typography } from '@material-ui/core'
import { messages } from 'src/translations/messages'
import { useIntl } from 'react-intl'

const useStyles = makeStyles(theme => ({
  errorIcon: {
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
  dialogContent: {
    padding: theme.spacing(1, 0),
    minWidth: 500,
  },
  content: {
    overflow: 'auto',
  },
}))
const StatusReport = ({ data, statusId }) => {
  const { errors, stats } = data
  const intl = useIntl()
  const classes = useStyles()
  return (
    <>
      <DialogContent className={classes.dialogContent} dividers>
        {
          statusId === 'status_ko' ?
            <div className={classes.content}>
              {
                errors.map(({ reason = {}, column = '', line = '' }, index) =>
                  (
                    <ListItem
                      classes={
                        {
                          divider: classes.divider,
                        }
                      }
                      dense
                      divider={index < errors.length - 1}
                      key={index}
                    >
                      <ListItemText
                        primary={intl.formatMessage(messages[`management_import_error_${reason.code}`], { value: reason.value })}
                      />
                      <Typography variant="caption">
                        {
                          (() => {
                            if (line && column) {
                              return `riga csv: ${line}, col: ${column}`
                            } else if (line && !column) {
                              return `riga csv: ${line}`
                            } else if (column && !line) {
                              return `col: ${column}`
                            } else {
                              return ''
                            }
                          })()
                        }
                      </Typography>
                    </ListItem>
                  )
                )
              }
            </div>
            :
            <div>
              <pre>
                {JSON.stringify(stats, null, 2)}
              </pre>
            </div>
        }
      </DialogContent>
    </>
  )
}

export default memo(StatusReport)

