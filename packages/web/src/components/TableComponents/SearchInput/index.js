import React from 'react'
import { IconButton, InputAdornment } from '@material-ui/core'
import { SearchPanel } from '@devexpress/dx-react-grid-material-ui'
import CloseIcon from '@material-ui/icons/Close'

export const SearchInput = props => (
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
    style={{maxWidth: 240}}
  />
)
