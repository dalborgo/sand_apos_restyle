import { colors, makeStyles, Typography, withStyles } from '@material-ui/core'
import React from 'react'
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { useMoneyFormatter } from 'src/utils/formatters'
import { messages } from 'src/translations/messages'
import { useIntl } from 'react-intl'

const useStyles = makeStyles(theme => ({
  iconGreen: {
    color: colors.green[700],
  },
  iconRed: {
    color: theme.palette.error.main,
  },
}))

const CellBase = props => {
  const { column, row, theme } = props
  const moneyFormatter = useMoneyFormatter()
  const intl = useIntl()
  const classes = useStyles()
  const cellStyle = { paddingLeft: theme.spacing(2), whiteSpace: 'normal' }
  if (column.name === 'status') {
    return (
      <VirtualTable.Cell {...props} style={cellStyle}>
        {
          (status => {
            switch (status) {
              case 'new':
                return (
                  <Typography className={classes.iconGreen} variant="body2">
                    {intl.formatMessage(messages['management_hotel_status_new_text'])}
                  </Typography>
                )
              case 'update':
                return (
                  <Typography color="secondary" variant="body2">
                    {intl.formatMessage(messages['management_hotel_status_update_text'])}
                  </Typography>
                )
              default:
                return (
                  <Typography className={classes.iconRed} variant="body2">
                    {intl.formatMessage(messages['management_hotel_status_delete_text'])}
                  </Typography>
                )
            }
          })(row.status)
        }
      </VirtualTable.Cell>
    )
  }
  if (column.name === 'net_price') {
    return (
      <VirtualTable.Cell {...props} style={cellStyle}>
        {moneyFormatter(row.net_price, false)}
      </VirtualTable.Cell>
    )
  }
  return <VirtualTable.Cell {...props} style={cellStyle}/>
}

const styles = theme => ({
  cell: {
    padding: theme.spacing(1, 2),
  },
})

export const Cell = withStyles(styles, { withTheme: true })(
  CellBase
)
