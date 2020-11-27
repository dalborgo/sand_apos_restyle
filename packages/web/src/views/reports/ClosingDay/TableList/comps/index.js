import { CircularProgress, Typography } from '@material-ui/core'
import React from 'react'
import { FormattedMessage } from 'react-intl'
import Box from '@material-ui/core/Box'
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui'

export const LoadingComponent = ({ colSpan, idle, loading }) => {
  return (
    <VirtualTable.Cell colSpan={colSpan}>
      <Box display="flex" justifyContent="center" p={5}>
        {
          loading ?
            <CircularProgress/>
            :
            idle ?
              <Typography><FormattedMessage defaultMessage="Seleziona date!" id="table.select_date"/></Typography>
              :
              <Typography><FormattedMessage defaultMessage="Nessun risultato!" id="table.no_data"/></Typography>
        }
      </Box>
    </VirtualTable.Cell>
  )
}
