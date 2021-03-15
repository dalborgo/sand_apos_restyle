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
  const filteringColumnExtensions = ['net_price', 'date']
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
  { columnName: 'net_price', align: 'right' },
  { columnName: 'id', align: 'center' },
  { columnName: 'status', align: 'center' },
]
const totalSummaryItems = []
const moneyColumns = ['net_price']
const TableList = memo(function TableList ({ rows, isFetching, isIdle }) {
  console.log('%c***EXPENSIVE_RENDER_TABLE', 'color: yellow')
  const intl = useIntl()
  const statusSelect = useCallback(({ status }) => {
    switch (status) {
      case 'new':
        return intl.formatMessage(messages['management_hotel_status_new_text'])
      case 'update':
        return intl.formatMessage(messages['management_hotel_status_update_text'])
      default:
        return intl.formatMessage(messages['management_hotel_status_delete_text'])
    }
  }, [intl])
  const [columns] = useState(() => {
    return [
      { name: 'description', title: intl.formatMessage(messages['common_description']) },
      { name: 'net_price', title: intl.formatMessage(messages['management_hotel_net_price']) },
      { name: 'id', title: intl.formatMessage(messages['management_hotel_id']) },
      { name: 'status', title: intl.formatMessage(messages['management_hotel_status']), getCellValue: statusSelect },
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
