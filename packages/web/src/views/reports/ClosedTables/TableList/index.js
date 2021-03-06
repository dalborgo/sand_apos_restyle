import React, { memo, useCallback, useState } from 'react'
import {
  Grid,
  TableHeaderRow,
  TableRowDetail,
  TableSummaryRow,
  Toolbar,
  VirtualTable,
} from '@devexpress/dx-react-grid-material-ui'
import { Cell, CellSummary, DetailCell, GridDetailContainerBase, summaryCalculator } from './comps'
import { useGeneralStore } from 'src/zustandStore'
import {
  IntegratedFiltering,
  IntegratedSummary,
  RowDetailState,
  SearchState,
  SummaryState,
} from '@devexpress/dx-react-grid'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { LoadingComponent } from 'src/components/TableComponents'
import { CellHeader, RootToolbar } from 'src/components/TableComponents/CellBase'
import { useMoneyFormatter } from 'src/utils/formatters'
import TableDetailToggleCell from './comps/TableDetailToggleCellBase'
import SearchPanelIntl from 'src/components/TableComponents/SearchPanelIntl'

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

const IntegratedFilteringSel = memo(function IntegratedFilteringSel () {
  const filteringColumnExtensions = ['covers', 'date']
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

const tableSelect = ({ table_display: Td, room_display: Rd, payments }) => {
  const { closed_by: closedBy } = Array.isArray(payments) ? payments[0] : payments
  return `${Td}${Rd}${closedBy}`
}
const { companySelect, hasSingleCompany } = useGeneralStore.getState()
const TableList = ({ rows, isFetching, isIdle }) => {
  console.log('%c***EXPENSIVE_RENDER_TABLE', 'color: yellow')
  const moneyFormatter = useMoneyFormatter()
  const intl = useIntl()
  const [columns] = useState(() => {
    const companySelect_ = ({ owner }) => companySelect(owner)
    const typeSelect = ({ payments }) => {
      const text = messages[`mode_${payments.mode}`] ? intl.formatMessage(messages[`mode_${payments.mode}`]) : payments.mode
      return Array.isArray(payments) ? intl.formatMessage(messages['common_dividedPayment']) : `${payments?.income}${text}`
    }
    const finalPriceSelect = ({
      final_price: Fp,
      discount_price: Dp,
    }) => `${moneyFormatter(Fp)}${Dp ? `-${moneyFormatter(Dp)}` : ''}`
    const columns_ = [
      { name: 'owner', title: intl.formatMessage(messages['common_building']), getCellValue: companySelect_ },
      { name: 'date', title: intl.formatMessage(messages['common_date']) },
      { name: 'table_display', title: intl.formatMessage(messages['common_table']), getCellValue: tableSelect },
      { name: 'type', title: intl.formatMessage(messages['common_type']), getCellValue: typeSelect },
      { name: 'covers', title: intl.formatMessage(messages['common_covers']) },
      { name: 'final_price', title: intl.formatMessage(messages['common_cashed']), getCellValue: finalPriceSelect },
    ]
    if (hasSingleCompany()) {columns_.shift()}
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
      <SearchState/>
      <SummaryState
        totalItems={totalSummaryItems}
      />
      <RowDetailState/>
      <IntegratedFilteringSel/>
      <IntegratedSummary calculator={summaryCalculator}/>
      <VirtualTable
        cellComponent={Cell}
        columnExtensions={tableColumnExtensions}
        height="auto"
        noDataCellComponent={noDataCellComponent}
      />
      <TableHeaderRow cellComponent={CellHeader}/>
      <TableSummaryRow messages={messagesSummary} totalCellComponent={CellSummary}/>
      <TableRowDetail
        cellComponent={DetailCell}
        contentComponent={GridDetailContainerBase}
        toggleCellComponent={TableDetailToggleCell}
        toggleColumnWidth={0.1}// con zero dà problemi con chrome
      />
      <Toolbar
        rootComponent={RootToolbar}
      />
      <SearchPanelIntl/>
    </Grid>
  )
}

export default memo(TableList)
