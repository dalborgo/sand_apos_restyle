import React, { memo } from 'react'
import { Grid, Typography } from '@material-ui/core'
import { FormattedMessage } from 'react-intl'

const Header = memo(function BrowserHeader () {
  return (
    <Grid
      container
      justify="space-between"
      spacing={3}
    >
      <Grid item>
        <Grid container spacing={3}>
          <Grid item>
            <Typography
              color="textPrimary"
              variant="h4"
            >
              <FormattedMessage defaultMessage="Lista Documenti" id="reports.header.list_documents"/>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
})

export default Header
