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
  { columnName: 'pu_totale_nc', align: 'right' },
  { columnName: 'income', align: 'right' },
]

const totalSummaryItems = [
  { columnName: 'income', type: 'incomeSum' },
  { columnName: 'pu_totale_nc', type: 'sum' },
]
const { companySelect, hasSingleCompany } = useGeneralStore.getState()
const TableList = memo(function TableList ({ rows, isFetching, isIdle }) {
  console.log('%c***EXPENSIVE_RENDER_TABLE', 'color: yellow')
  const intl = useIntl()
  const [columns] = useState(() => {
    const companySelect_ = ({ owner }) => companySelect(owner)
    const columns_ = [
      { name: 'owner', title: intl.formatMessage(messages['common_building']), getCellValue: companySelect_ },
      { name: 'date', title: intl.formatMessage(messages['common_date']) },
      { name: 'pu_totale_nc', title: intl.formatMessage(messages['common_covers']) },
      { name: 'income', title: intl.formatMessage(messages['common_cashed']) },
    ]
    if (hasSingleCompany()) {columns_.shift()}
    return columns_
  })
  const [messagesSummary] = useState(() => ({
    sum: intl.formatMessage(messages['common_total']),
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
