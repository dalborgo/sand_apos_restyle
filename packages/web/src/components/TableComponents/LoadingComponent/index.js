import React, { memo } from 'react'
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import Box from '@material-ui/core/Box'
import { Typography } from '@material-ui/core'
import { FormattedMessage } from 'react-intl'

const LoadingComponent = memo(function LoadingComponent ({ idle, isFetching, ...rest }) {
  return (
    <VirtualTable.Cell {...rest} style={{ border: 'none' }}>
      <Box display="flex" justifyContent="center" p={5}>
        {
          isFetching ?
            <Typography><FormattedMessage defaultMessage="Caricamento..." id="common.loading"/></Typography>
            :
            idle === true ?
              <Typography><FormattedMessage defaultMessage="Ricerca per date" id="table.select_date"/></Typography>
              :
              <Typography><FormattedMessage defaultMessage="Nessun risultato!" id="table.no_data"/></Typography>
        }
      </Box>
    </VirtualTable.Cell>
  )
})

export default LoadingComponent
