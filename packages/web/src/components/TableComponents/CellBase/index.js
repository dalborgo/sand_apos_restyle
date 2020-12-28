import React from 'react'
import { withStyles } from '@material-ui/core'
import { TableHeaderRow, Toolbar, VirtualTable } from '@devexpress/dx-react-grid-material-ui'

const styleCell = theme => ({
  cell: {
    padding: theme.spacing(1, 2),
  },
})
const styleToolbar = theme => ({
  toolbar: {
    padding: theme.spacing(1, 2),
    minHeight: theme.spacing(6),
    borderBottom: 0,
    [theme.breakpoints.down('sm')]: { //mobile
      display: 'none',
    },
  },
})
export const SummaryCellBase = props => {
  return <VirtualTable.Cell {...props}/>
}

export const CellSummary = withStyles(styleCell, { withTheme: true })(
  SummaryCellBase
)
//c'era un warning sul campo children mancante
export const CellHeader = withStyles(styleCell, { withTheme: true })(
  ({ theme, children, ...rest }) => (
    <TableHeaderRow.Cell
      {...rest}
      children={children}
      style={{ paddingLeft: theme.spacing(2) }} //la prima cella prendeva un valore più forte
    />
  )
)

export const RootToolbar = withStyles(styleToolbar)(
  (props) => (
    <Toolbar.Root
      {...props}
    />
  )
)
