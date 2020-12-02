import React, { memo } from 'react'
import { Grid, Typography } from '@material-ui/core'

const Header = memo(function BrowserHeader ({ children }) {
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
              {children}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
})

export default Header
