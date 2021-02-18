import React, { memo, useCallback, useState } from 'react'
import { Grid, TableHeaderRow, TableSummaryRow, VirtualTable } from '@devexpress/dx-react-grid-material-ui'
import { Cell } from './comps'
import { useGeneralStore } from 'src/zustandStore'
import { IntegratedSummary, SummaryState } from '@devexpress/dx-react-grid'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { MoneyTypeProvider } from 'src/utils/tableFormatters'
import { LoadingComponent } from 'src/components/TableComponents'
import { CellHeader, CellSummary } from 'src/components/TableComponents/CellBase'
import { IconButton, SvgIcon, Tooltip } from '@material-ui/core'
import { Package as PackageIcon } from 'react-feather'

const getRowId = row => row._id
const Root = props => <Grid.Root {...props} style={{ height: '100%' }}/>

const tableColumnExtensions = [
  { columnName: 'download', width: 80 },
  { columnName: 'final_price', align: 'right' },
]
const totalSummaryItems = [
  { columnName: 'table_display', type: 'count' },
  { columnName: 'final_price', type: 'sum' },
]
const moneyColumns = ['final_price']
const { companySelect, hasSingleCompany } = useGeneralStore.getState()
const TableList = memo(function TableList ({ rows, isFetching, isIdle, exportZip }) {
  console.log('%c***EXPENSIVE_RENDER_TABLE', 'color: yellow')
  const intl = useIntl()
  const [columns] = useState(() => {
    const companySelect_ = ({ owner }) => companySelect(owner)
    const columns_ = [
      { name: 'download' },
      { name: 'owner', title: intl.formatMessage(messages['common_building']), getCellValue: companySelect_ },
      { name: 'date', title: intl.formatMessage(messages['common_date']) },
      { name: 'table_display', title: intl.formatMessage(messages['common_table']) },
      { name: 'type', title: intl.formatMessage(messages['common_customer']) },
      { name: 'final_price', title: intl.formatMessage(messages['common_cashed']) },
    ]
    if (hasSingleCompany()) {columns_.splice(1, 1)}
    return columns_
  })
  const [messagesSummary] = useState(() => ({
    sum: intl.formatMessage(messages['common_total']),
    count: intl.formatMessage(messages['common_total']),
  }))
  const noDataCellComponent = useCallback(({ colSpan }) =>
    <LoadingComponent colSpan={colSpan} idle={isIdle} isFetching={isFetching}/>, [isFetching, isIdle])
  
  const TitleComponent = useCallback(({ children: columnTitle }) => {
    return (
      <TableHeaderRow.Title>
        {
          columnTitle === 'download' ?
            Boolean(rows.length) &&
            <Tooltip
              title={intl.formatMessage(messages['reports_e_invoices_download_xml_zip'])}
            >
              <IconButton
                color="secondary"
                onClick={exportZip}
              >
                <SvgIcon fontSize="small">
                  <PackageIcon/>
                </SvgIcon>
              </IconButton>
            </Tooltip>
            :
            columnTitle
        }
      </TableHeaderRow.Title>
    )
  }, [exportZip, intl, rows.length])
  
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
      <TableHeaderRow cellComponent={CellHeader} titleComponent={TitleComponent}/>
      <TableSummaryRow messages={messagesSummary} totalCellComponent={CellSummary}/>
    </Grid>
  )
})
export default TableList
