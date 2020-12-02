import React from 'react'
import { calculateClosingTable } from './calculation'

function ClosingTable ({ data }) {
  const closing = data?.results
  return (
    <div>
      {JSON.stringify(calculateClosingTable(closing), null, 2)}
    </div>
  )
}

export default ClosingTable
