import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { Table } from '@devexpress/dx-react-grid-material-ui'

const TableDetailToggleCell = ({
  // eslint-disable-next-line no-unused-vars
  expanded,
  onToggle,
  row,
  ...restProps
}) => {
  const handleClick = useCallback(event => {
    event.stopPropagation()
    onToggle()
  },[onToggle])
  const { payments, _id } = row
  if (Array.isArray(payments)) {
    return (
      <Table.Cell
        {...restProps}
      >
        <button
          id={`expand${_id}`}
          onClick={handleClick}
          style={{display: 'none'}}
        />
      </Table.Cell>
    )
  } else {
    return (
      <Table.Cell
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
