import React from 'react'
import { Grid, TableHeaderRow, VirtualTable } from '@devexpress/dx-react-grid-material-ui'

const getRowId = row => row._id
const Root = props => <Grid.Root {...props} style={{ height: '100%' }}/>

const columns = [
  { name: 'close_date', title: 'Data' },
  { name: 'owner', title: 'Proprietario' },
]

const TableList = ({ rows, loading }) => {
  return (
    <Grid
      columns={columns}
      getRowId={getRowId}
      rootComponent={Root}
      rows={rows}
    >
      <VirtualTable
        height="auto"
      />
      <TableHeaderRow/>
    </Grid>
  )
}

export default TableList
