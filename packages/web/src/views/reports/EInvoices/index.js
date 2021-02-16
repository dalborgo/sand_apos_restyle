import React from 'react'
import Page from 'src/components/Page'
import { Box, makeStyles } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import StandardHeader from 'src/components/StandardHeader'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    height: '100%',
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    display: 'flex',
    overflowY: 'hidden',
    overflowX: 'auto',
  },
  innerFirst: {
    display: 'flex',
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      padding: 0,
    },
  },
}))

const EInvoices = () => {
  const classes = useStyles()
  const intl = useIntl()
  return (
    <Page
      className={classes.root}
      title={intl.formatMessage(messages['menu_e_invoices'])}
    >
      <Box p={3} pb={2}>
        <StandardHeader>
          <FormattedMessage defaultMessage="Fatture elettroniche" id="reports.e_invoices.header_title"/>
        </StandardHeader>
      </Box>
      <div className={classes.content}>
        <div className={classes.innerFirst}>
          Prova
        </div>
      </div>
    </Page>
  )
}

export default EInvoices
