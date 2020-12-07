import React, { memo } from 'react'
import { Grid, Typography } from '@material-ui/core'

const StandardHeader = memo(function StandardHeader ({ children, rightComponent, breadcrumb }) {
  return (
    <Grid
      alignItems="center"
      container
      justify="space-between"
      spacing={3}
    >
      <Grid item>
        <Grid container spacing={3}>
          <Grid item>
            {
              breadcrumb && breadcrumb
            }
            <Typography
              color="textPrimary"
              variant="h4"
            >
              {children}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      {
        rightComponent &&
        <Grid item>
          {rightComponent}
        </Grid>
      }
    </Grid>
  )
})

export default StandardHeader
