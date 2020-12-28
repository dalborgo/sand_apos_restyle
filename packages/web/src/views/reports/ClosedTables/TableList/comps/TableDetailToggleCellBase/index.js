import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { withStyles } from '@material-ui/core/styles'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { IconButton, TableCell } from '@material-ui/core'

const styles = theme => ({
  toggleCell: {
    textAlign: 'center',
    textOverflow: 'initial',
    paddingTop: 0.8,
    paddingBottom: 0,
    paddingLeft: theme.spacing(1),
  },
  toggleCellButton: {
    height: theme.spacing(5),
    width: theme.spacing(5),
  },
})

const TableDetailToggleCellBase = ({
  className,
  classes,
  expanded,
  onToggle,
  row,
  style,
  // eslint-disable-next-line no-unused-vars
  tableColumn,
  // eslint-disable-next-line no-unused-vars
  tableRow,
  ...restProps
}) => {
  const handleClick = event => {
    event.stopPropagation()
    onToggle()
  }
  const { payments } = row
  if (Array.isArray(payments)) {
    return (
      <TableCell
        className={clsx(classes.toggleCell, className)}
        style={style}
        {...restProps}
      >
        <IconButton
          className={classes.toggleCellButton}
          onClick={handleClick}
        >
          {expanded ? <ExpandLess/> : <ExpandMore/>}
        </IconButton>
      </TableCell>
    )
  } else {
    return (
      <TableCell
        className={className}
        style={style}
        {...restProps}
      />
    )
  }
}

TableDetailToggleCellBase.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  expanded: PropTypes.bool,
  row: PropTypes.object,
  style: PropTypes.object,
  tableColumn: PropTypes.object,
  tableRow: PropTypes.object,
  onToggle: PropTypes.func,
}

TableDetailToggleCellBase.defaultProps = {
  style: null,
  expanded: false,
  onToggle: () => {},
  className: undefined,
  tableColumn: undefined,
  tableRow: undefined,
  row: undefined,
}

const TableDetailToggleCell = withStyles(styles, {
  name: 'TableDetailToggleCell',
})(TableDetailToggleCellBase)

export default TableDetailToggleCell
