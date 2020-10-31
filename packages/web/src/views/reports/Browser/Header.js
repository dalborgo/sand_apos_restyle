import React, { memo } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Breadcrumbs, Grid, Link, Typography } from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import { FormattedMessage } from 'react-intl'

const Header = memo(() => {
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
          <Grid item>
            <Breadcrumbs
              aria-label="breadcrumb"
              separator={<NavigateNextIcon fontSize="small"/>}
            >
              <Link
                color="inherit"
                component={RouterLink}
                to="/app"
                variant="body1"
              >
                Dashboard
              </Link>
              <Typography
                color="textPrimary"
                variant="body1"
              >
                Browser
              </Typography>
            </Breadcrumbs>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
})
Header.displayName = 'Browser Header'

export default Header
