import React from 'react'
import { IconButton, InputAdornment, makeStyles } from '@material-ui/core'
import { SearchPanel } from '@devexpress/dx-react-grid-material-ui'
import CloseIcon from '@material-ui/icons/Close'
const useStyles = makeStyles(theme => ({
  container: {
    '& .MuiInputBase-input ': {
      fontSize: theme.typography.pxToRem(15),
    },
  },
}))


export const SearchInput = props => {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      <SearchPanel.Input
        {...props}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={() => props.onValueChange('')}
            >
              <CloseIcon fontSize="small"/>
            </IconButton>
          </InputAdornment>
        }
        onFocus={event => event.target.select()}
        style={{ maxWidth: 240 }}
      />
    </div>

  )
}
