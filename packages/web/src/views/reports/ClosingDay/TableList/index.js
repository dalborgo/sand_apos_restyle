import React, { memo, useCallback } from 'react'
import { Grid, TableHeaderRow, VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { Cell, LoadingComponent } from './comps'
import { useGeneralStore } from 'src/zustandStore'
import { DateTypeProvider } from 'src/utils/tableFormatters'

const getRowId = row => row._id
const Root = props => <Grid.Root {...props} style={{ height: '100%' }}/>
const companyData = useGeneralStore.getState().companyData
const companySelect = ({ owner }) => companyData ? companyData?.[owner]?.name : owner
const columns = [
  { name: 'owner', title: 'Struttura', getCellValue: companySelect },
  { name: 'date', title: 'Data' },
  { name: 'pu_totale_nc', title: 'Coperti' },
  { name: 'income', title: 'Incassato' },
]
const tableColumnExtensions = [
  { columnName: 'pu_totale_nc', align: 'right' },
  { columnName: 'income', align: 'right' },
]

const companyNumEntries = Object.keys(companyData).length
if (companyNumEntries < 2) {
  columns.shift()
}
const dateColumns = ['date']

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
      <DateTypeProvider
        for={dateColumns}
      />
      <VirtualTable
        cellComponent={Cell}
        columnExtensions={tableColumnExtensions}
        height="auto"
        noDataCellComponent={noDataCellComponent}
      />
      <TableHeaderRow/>
    </Grid>
  )
}

export default memo(TableList)
