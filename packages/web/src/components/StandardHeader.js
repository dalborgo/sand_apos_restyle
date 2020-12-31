import React, { memo } from 'react'
import { Grid, Typography, withWidth } from '@material-ui/core'

const StandardHeader = ({ children, rightComponent, breadcrumb, width }) => {
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
              (breadcrumb && width !== 'xs') && breadcrumb
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
}
export default memo(withWidth()(StandardHeader))
