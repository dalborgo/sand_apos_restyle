import React, { memo, useCallback, useState } from 'react'
import { Grid, TableHeaderRow, TableSummaryRow, VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { Cell, CellSummary, summaryCalculator } from './comps'
import { useGeneralStore } from 'src/zustandStore'
import { IntegratedSummary, SummaryState } from '@devexpress/dx-react-grid'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { LoadingComponent } from 'src/components/TableComponents'
import { CellHeader } from 'src/components/TableComponents/CellBase'

const getRowId = row => row._id
const Root = props => <Grid.Root {...props} style={{ height: '100%' }}/>

const tableColumnExtensions = [
  { columnName: 'covers', align: 'right' },
  { columnName: 'final_price', align: 'right' },
]
const totalSummaryItems = [
  { columnName: 'table_display', type: 'count' },
  { columnName: 'covers', type: 'sum' },
  { columnName: 'final_price', type: 'incomeSum' },
]

const TableList = memo(function TableList ({ rows, isFetching, isIdle }) {
  console.log('%c***EXPENSIVE_RENDER_TABLE', 'color: yellow')
  const intl = useIntl()
  const [columns] = useState(() => {
    const companyData = useGeneralStore.getState().companyData
    const companySelect = ({ owner }) => companyData ? companyData?.[owner]?.name : owner
    const columns_ = [
      { name: 'owner', title: intl.formatMessage(messages['common_building']), getCellValue: companySelect },
      { name: 'date', title: intl.formatMessage(messages['common_date']) },
      { name: 'table_display', title: intl.formatMessage(messages['common_table']) },
      { name: 'type', title: intl.formatMessage(messages['common_type']) },
      { name: 'covers', title: intl.formatMessage(messages['common_covers']) },
      { name: 'final_price', title: intl.formatMessage(messages['common_income']) },
    ]
    if (Object.keys(companyData).length < 2) {columns_.shift()}
    return columns_
  })
  const [messagesSummary] = useState(() => ({
    sum: intl.formatMessage(messages['common_total']),
    count: intl.formatMessage(messages['common_total']),
  }))
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
      <TableSummaryRow messages={messagesSummary} totalCellComponent={CellSummary}/>
    </Grid>
  )
})

export default TableList
