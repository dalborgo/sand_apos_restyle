import React from 'react'
import Page from 'src/components/Page'
import { makeStyles, Paper } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import StandardHeader from 'src/components/StandardHeader'
import { StandardBreadcrumb } from 'src/components/StandardBreadcrumb'

import DivContentWrapper from 'src/components/DivContentWrapper'

const useStyles = makeStyles(theme => ({
  paper: {
    height: '100%',
  },
  container: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {// mobile
      padding: theme.spacing(0, 2),
    },
  },
}))

const Import = () => {
  const classes = useStyles()
  const intl = useIntl()
  return (
    <Page
      title={intl.formatMessage(messages['menu_import'])}
    >
      <div className={classes.container}>
        <StandardHeader
          breadcrumb={
            <StandardBreadcrumb
              crumbs={[{ to: '/app', name: 'DashBoard' }, { name: intl.formatMessage(messages['sub_management']) }]}
            />
          }
        >
          <FormattedMessage defaultMessage="Import" id="management.import.header_title"/>
        </StandardHeader>
      </div>
      <DivContentWrapper>
        <Paper className={classes.paper}>
          Prova
        </Paper>
      </DivContentWrapper>
    </Page>
  )
}

export default Import
