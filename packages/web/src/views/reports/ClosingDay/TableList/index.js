import React, { memo, useCallback } from 'react'
import { Grid, TableHeaderRow, VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { LoadingComponent } from './comps'
import { useGeneralStore } from 'src/zustandStore'

const getRowId = row => row._id
const Root = props => <Grid.Root {...props} style={{ height: '100%' }}/>
const companyData = useGeneralStore.getState().companyData
const companySelect = ({ owner }) => companyData ? companyData?.[owner]?.name : owner
const columns = [
  { name: 'close_date', title: 'Data' },
  { name: 'owner', title: 'Proprietario', getCellValue: companySelect },
]

const TableList = ({ rows, isLoading, isIdle }) => {
  console.log('%c***EXPENSIVE_RENDER_TABLE', 'color: yellow')
  const noDataCellComponent = useCallback(({ colSpan }) =>
    <LoadingComponent colSpan={colSpan} idle={isIdle} loading={isLoading}/>, [isLoading, isIdle])
  
  return (
    <Grid
      columns={columns}
      getRowId={getRowId}
      rootComponent={Root}
      rows={rows}
    >
      <VirtualTable
        height="auto"
        noDataCellComponent={noDataCellComponent}
      />
      <TableHeaderRow/>
    </Grid>
  )
}

export default memo(TableList)
