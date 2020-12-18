import React, { memo } from 'react'
import { Button, createMuiTheme, SvgIcon, ThemeProvider, useTheme } from '@material-ui/core'
import { red } from '@material-ui/core/colors'
import { Filter as FilterIcon } from 'react-feather'
import { FormattedMessage } from 'react-intl'

export default memo(function FilterButton ({ isActive, onClick }) {
  const theme = useTheme()
  return (
    <ThemeProvider
      theme={
        createMuiTheme({
          palette: {
            secondary: {
              main: isActive ? red[400] : theme.palette.secondary.main,
            },
          },
        })
      }
    >
      <Button
        color="secondary"
        disableFocusRipple //necessario perché c'è una sovrascrittura del tema
        onClick={onClick}
        size="small"
        variant="contained"
      >
        <SvgIcon fontSize="small">
          <FilterIcon/>
        </SvgIcon>
        &nbsp;&nbsp;<FormattedMessage defaultMessage="Filtri" id="common.filters"/>
      </Button>
    </ThemeProvider>
  )
})
