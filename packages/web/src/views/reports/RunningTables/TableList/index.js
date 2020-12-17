import React, { memo, useCallback, useState } from 'react'
import { Grid, TableHeaderRow, TableSummaryRow, VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { Cell, CellHeader, CellSummary, LoadingComponent } from './comps'
import { useGeneralStore } from 'src/zustandStore'
import { IntegratedSummary, SummaryState } from '@devexpress/dx-react-grid'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { MoneyTypeProvider } from 'src/utils/tableFormatters'

const getRowId = row => row._id
const Root = props => <Grid.Root {...props} style={{ height: '100%' }}/>

const tableColumnExtensions = [
  { columnName: 'covers', align: 'right' },
  { columnName: 'income', align: 'right' },
]
const totalSummaryItems = [
  { columnName: 'table_display', type: 'count' },
  { columnName: 'covers', type: 'sum' },
  { columnName: 'income', type: 'sum' },
]

const moneyColumns = ['income']
const TableList = memo(function TableList ({ rows, isFetching }) {
  console.log('%c***EXPENSIVE_RENDER_TABLE', 'color: yellow')
  const intl = useIntl()
  const [columns] = useState(() => {
    const companyData = useGeneralStore.getState().companyData
    const companySelect = ({ owner }) => companyData ? companyData?.[owner]?.name : owner
    const columns_ = [
      { name: 'owner', title: intl.formatMessage(messages['common_building']), getCellValue: companySelect },
      { name: 'last_saved_date', title: intl.formatMessage(messages['common_date']) },
      { name: 'table_display', title: intl.formatMessage(messages['common_table']) },
      { name: 'covers', title: intl.formatMessage(messages['common_covers']) },
      { name: 'income', title: intl.formatMessage(messages['common_income']) },
    ]
    const companyNumEntries = Object.keys(companyData).length
    if (companyNumEntries < 2) {
      columns_.shift()
    }
    return columns_
  })
  const [messagesSummary] = useState(() => ({
    sum: intl.formatMessage(messages['common_total']),
    count: intl.formatMessage(messages['common_total']),
  }))
  const noDataCellComponent = useCallback(({ colSpan }) =>
    <LoadingComponent colSpan={colSpan} isFetching={isFetching}/>, [isFetching])
  
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
