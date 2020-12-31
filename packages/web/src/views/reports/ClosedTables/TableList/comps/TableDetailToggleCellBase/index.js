import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { TableCell } from '@material-ui/core'

const TableDetailToggleCell = ({
  className,
  // eslint-disable-next-line no-unused-vars
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
  const handleClick = useCallback(event => {
    event.stopPropagation()
    onToggle()
  },[onToggle])
  const { payments, _id } = row
  if (Array.isArray(payments)) {
    return (
      <TableCell
        className={className}
        style={style}
        {...restProps}
      >
        <button
          id={`expand${_id}`}
          onClick={handleClick}
          style={{display: 'none'}}
        />
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

TableDetailToggleCell.propTypes = {
  classes: PropTypes.object,
  className: PropTypes.string,
  expanded: PropTypes.bool,
  row: PropTypes.object,
  style: PropTypes.object,
  tableColumn: PropTypes.object,
  tableRow: PropTypes.object,
  onToggle: PropTypes.func,
}

TableDetailToggleCell.defaultProps = {
  style: null,
  expanded: false,
  onToggle: () => {},
  className: undefined,
  tableColumn: undefined,
  tableRow: undefined,
  row: undefined,
}

export default TableDetailToggleCell
