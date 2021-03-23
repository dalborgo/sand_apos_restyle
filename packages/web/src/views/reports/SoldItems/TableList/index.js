import React, { memo, useCallback, useState } from 'react'
import { Grid, TableHeaderRow, TableSummaryRow, Toolbar, VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { Cell } from './comps'
import { IntegratedFiltering, IntegratedSummary, SearchState, SummaryState } from '@devexpress/dx-react-grid'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { MoneyTypeProvider } from 'src/utils/tableFormatters'
import { LoadingComponent } from 'src/components/TableComponents'
import { CellHeader, CellSummary, RootToolbar } from 'src/components/TableComponents/CellBase'
import SearchPanelIntl from 'src/components/TableComponents/SearchPanelIntl'

const IntegratedFilteringSel = memo(function IntegratedFilteringSel () {
  const filteringColumnExtensions = ['price']
    .map(columnName => ({
      columnName,
      predicate: () => false,
    }))
  return (
    <IntegratedFiltering
      columnExtensions={filteringColumnExtensions}
    />
  )
})

const Root = props => <Grid.Root {...props} style={{ height: '100%' }}/>
const tableColumnExtensions = [
  { columnName: 'price', align: 'right' },
]
const totalSummaryItems = []
const moneyColumns = ['net_price']
const TableList = memo(function TableList ({ rows, isFetching, isIdle }) {
  console.log('%c***EXPENSIVE_RENDER_TABLE', 'color: yellow')
  const intl = useIntl()
  const [columns] = useState(() => {
    return [
      { name: 'category', title: intl.formatMessage(messages['common_category']) },
      { name: 'product', title: intl.formatMessage(messages['common_product']) },
      { name: 'price', title: intl.formatMessage(messages['common_price']) },
    ]
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
      rootComponent={Root}
      rows={rows}
    >
      <MoneyTypeProvider
        for={moneyColumns}
      />
      <SearchState/>
      <SummaryState
        totalItems={totalSummaryItems}
      />
      <IntegratedFilteringSel/>
      <IntegratedSummary/>
      <VirtualTable
        cellComponent={Cell}
        columnExtensions={tableColumnExtensions}
        height="auto"
        noDataCellComponent={noDataCellComponent}
      />
      <TableHeaderRow cellComponent={CellHeader}/>
      <TableSummaryRow messages={messagesSummary} totalCellComponent={CellSummary}/>
      <Toolbar rootComponent={RootToolbar}/>
      <SearchPanelIntl/>
    </Grid>
  )
})
export default TableList
