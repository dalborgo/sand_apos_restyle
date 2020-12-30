import React from 'react'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { makeStyles, Typography } from '@material-ui/core'

const useStyles = makeStyles(() => ({
  boldText: {
    fontWeight: 'bold',
  },
}))

function LabeledTypo ({label, text}) {
  const intl = useIntl()
  const classes = useStyles()
  return (
    <>
      <Typography display="inline" style={{ fontWeight: 'normal' }} variant="h6">
        {intl.formatMessage(messages[label])}{': '}
      </Typography>
      <Typography className={classes.boldText} display="inline" variant="body2">
        {text}
      </Typography>
    </>

  )
}

export default LabeledTypo
