import React, { memo, useCallback, useState } from 'react'
import { Grid, TableHeaderRow, TableSummaryRow, VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { Cell, CellHeader, CellSummary, LoadingComponent, summaryCalculator } from './comps'
import { useGeneralStore } from 'src/zustandStore'
import { IntegratedSummary, SummaryState } from '@devexpress/dx-react-grid'

const getRowId = row => row._id
const Root = props => <Grid.Root {...props} style={{ height: '100%' }}/>

const tableColumnExtensions = [
  { columnName: 'pu_totale_nc', align: 'right' },
  { columnName: 'income', align: 'right' },
]

const totalSummaryItems = [
  { columnName: 'income', type: 'incomeSum' },
]
const TableList = ({ rows, isFetching, isIdle }) => {
  console.log('%c***EXPENSIVE_RENDER_TABLE', 'color: yellow')
  const [columns] = useState(() => {
    const companyData = useGeneralStore.getState().companyData
    const companySelect = ({ owner }) => companyData ? companyData?.[owner]?.name : owner
    const columns_ = [
      { name: 'owner', title: 'Struttura', getCellValue: companySelect },
      { name: 'date', title: 'Data' },
      { name: 'pu_totale_nc', title: 'Coperti' },
      { name: 'income', title: 'Incassato' },
    ]
    const companyNumEntries = Object.keys(companyData).length
    if (companyNumEntries < 2) {
      columns_.shift()
    }
    return columns_
  })
  
  const noDataCellComponent = useCallback(({ colSpan }) =>
    <LoadingComponent colSpan={colSpan} idle={isIdle} isFetching={isFetching}/>, [isFetching, isIdle])
  
  return (
    <Grid
      columns={columns}
      getRowId={getRowId}
      rootComponent={Root}
      rows={rows}
    >
      <SummaryState
        totalItems={totalSummaryItems}
      />
      <IntegratedSummary calculator={summaryCalculator}/>
      <VirtualTable
        cellComponent={Cell}
        columnExtensions={tableColumnExtensions}
        height="auto"
        noDataCellComponent={noDataCellComponent}
      />
      <TableHeaderRow cellComponent={CellHeader}/>
      <TableSummaryRow totalCellComponent={CellSummary}/>
    </Grid>
  )
}

export default memo(TableList)
