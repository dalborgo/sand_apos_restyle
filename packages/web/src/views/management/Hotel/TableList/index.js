import React, { memo, useCallback, useState } from 'react'
import { Grid, TableHeaderRow, TableSummaryRow, VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { Cell } from './comps'
import { IntegratedSummary, SummaryState } from '@devexpress/dx-react-grid'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { MoneyTypeProvider } from 'src/utils/tableFormatters'
import { LoadingComponent } from 'src/components/TableComponents'
import { CellHeader, CellSummary } from 'src/components/TableComponents/CellBase'

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
  const [columns] = useState(() => {
    return [
      { name: 'description', title: intl.formatMessage(messages['common_description']) },
      { name: 'net_price', title: intl.formatMessage(messages['management_hotel_net_price']) },
      { name: 'id', title: intl.formatMessage(messages['management_hotel_id']) },
      { name: 'status', title: intl.formatMessage(messages['management_hotel_status']) },
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
      <SummaryState
        totalItems={totalSummaryItems}
      />
      <IntegratedSummary/>
      <MoneyTypeProvider
        for={moneyColumns}
      />
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
