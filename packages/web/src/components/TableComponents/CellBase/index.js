import React from 'react'
import { withStyles } from '@material-ui/core'
import { TableHeaderRow, VirtualTable } from '@devexpress/dx-react-grid-material-ui'

const styles = theme => ({
  cell: {
    padding: theme.spacing(1, 2),
  },
})
export const SummaryCellBase = props => {
  return <VirtualTable.Cell {...props}/>
}

export const CellSummary = withStyles(styles, { withTheme: true })(
  SummaryCellBase
)
//c'era un warning sul campo children mancante
export const CellHeader = withStyles(styles, { withTheme: true })(
  ({ classes, theme, children, ...rest }) => (
    <TableHeaderRow.Cell
      {...rest}
      children={children}
      className={classes.cell}
      style={{ paddingLeft: theme.spacing(2) }}
    />
  )
)
