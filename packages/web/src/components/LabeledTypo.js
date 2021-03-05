import React from 'react'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { makeStyles, Typography } from '@material-ui/core'

const useStyles = makeStyles(() => ({
  boldText: {
    fontWeight: 'bold',
  },
}))

function LabeledTypo ({label, text, variant = {}}) {
  const intl = useIntl()
  const classes = useStyles()
  const { variantLabel = 'h6', variantText = 'body2' } = variant
  return (
    <>
      <Typography display="inline" style={{ fontWeight: 'normal' }} variant={variantLabel}>
        {intl.formatMessage(messages[label])}{': '}
      </Typography>
      <Typography className={classes.boldText} display="inline" variant={variantText}>
        {text}
      </Typography>
    </>

  )
}

export default LabeledTypo
