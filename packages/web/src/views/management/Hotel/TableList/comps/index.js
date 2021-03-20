import { Chip, colors, makeStyles, withStyles } from '@material-ui/core'
import React from 'react'
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { useMoneyFormatter } from 'src/utils/formatters'
import { messages } from 'src/translations/messages'
import { useIntl } from 'react-intl'

const useStyles = makeStyles(() => ({
  iconGreen: {
    backgroundColor: colors.green[200],
  },
  iconBlue: {
    backgroundColor: colors.blue[200],
  },
  iconRed: {
    backgroundColor: colors.orange[200],
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
                  <Chip
                    className={classes.iconGreen}
                    label={intl.formatMessage(messages['management_hotel_status_new_text'])}
                    size="small"
                  />
                )
              case 'update':
                return (
                  <Chip
                    className={classes.iconBlue}
                    label={intl.formatMessage(messages['management_hotel_status_update_text'])}
                    size="small"
                  />
                )
              default:
                return (
                  <Chip
                    className={classes.iconRed}
                    label={intl.formatMessage(messages['management_hotel_status_delete_text'])}
                    size="small"
                  />
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
