import React, { memo } from 'react'
import { DialogContent, Grid, ListItem, ListItemText, makeStyles, Typography, useTheme } from '@material-ui/core'
import { messages } from 'src/translations/messages'
import { useIntl } from 'react-intl'
import LabeledTypo from 'src/components/LabeledTypo'

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
  dialogContent: {
    padding: theme.spacing(1.5, 1),
  },
  content: {
    overflow: 'auto',
    minWidth: 500,
  },
}))
const StatusReport = ({ data, statusId }) => {
  const { errors, stats } = data
  const theme = useTheme()
  const intl = useIntl()
  const classes = useStyles()
  return (
    <>
      <DialogContent className={classes.dialogContent} dividers>
        {
          statusId === 'status_ko' ?
            <div className={classes.content}>
              {
                errors.map(({ reason = {}, column = '', line = '', extra }, index) =>
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
                        className={classes.listItemText}
                        primary={
                          intl.formatMessage(messages[`management_import_error_${reason.code}`], {
                            value: reason.value,
                            column,
                            extra,
                          })
                        }
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
            <Grid
              container
              direction="column"
            >
              <Grid item style={{ margin: theme.spacing(1, 2, 1) }}>
                <Grid container style={{ width: '100%' }}>
                  <Grid item style={{ width: 140 }}>
                    <LabeledTypo
                      label="common_file"
                      text={intl.formatMessage(messages[`astenpos_type_${stats.type}`])}
                    />
                  </Grid>
                  <Grid item style={{ width: 150 }}>
                    <LabeledTypo
                      label="management_import_total_records"
                      text={stats.records}
                    />
                  </Grid>
                  <Grid item>
                    <LabeledTypo
                      label="management_import_processed_records"
                      text={stats.records - stats.notSaved}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item style={{ margin: theme.spacing(1, 2, 0) }}>
                <Grid container style={{ width: '100%' }}>
                  <Grid item style={{ width: 140 }}>
                    <LabeledTypo
                      label="management_import_total_creations"
                      text={stats.totalCreations}
                    />
                  </Grid>
                  <Grid item style={{ width: 150 }}>
                    <LabeledTypo
                      label="management_import_total_modifications"
                      text={stats.totalModifications}
                    />
                  </Grid>
                  <Grid item>
                    <LabeledTypo
                      label="management_import_total_not_saved"
                      text={stats.notSaved}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
        }
      </DialogContent>
    </>
  )
}

export default memo(StatusReport)

