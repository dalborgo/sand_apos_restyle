import React, { memo, useState } from 'react'
import { Grid, TableHeaderRow, TableSummaryRow, VirtualTable, Table } from '@devexpress/dx-react-grid-material-ui'
import { messages } from 'src/translations/messages'
import { useIntl } from 'react-intl'
import { Cell } from './comps'
import { MoneyTypeProvider } from 'src/utils/tableFormatters'
import { IntegratedSummary, SummaryState } from '@devexpress/dx-react-grid'
import { CellHeader, CellSummary } from 'src/components/TableComponents/CellBase'
import { withWidth } from '@material-ui/core'
const tableColumnExtensions = [
  { columnName: 'pro_qta', align: 'right' },
  { columnName: 'amount', align: 'right' },
  { columnName: 'unit_price', align: 'right' },
]

const totalSummaryItems = [
  { columnName: 'amount', type: 'sum' },
]

const getUnitPrice = ({ amount, pro_qta: proQta }) => amount / proQta
const moneyColumns = ['amount', 'unit_price']
const SelectiveTable = memo(function SelectiveTable ({ width }) {
  const [isSmall] = useState(() => ['xs','sm'].includes(width)) //lo faccio statico
  if (isSmall) {
    return (
      <Table
        cellComponent={Cell}
        columnExtensions={tableColumnExtensions}
      />
    )
  } else {
    return (
      <VirtualTable
        cellComponent={Cell}
        columnExtensions={tableColumnExtensions}
      />
    )
  }
})

function DetailTable ({ data, width }) {
  const intl = useIntl()
  const [columns] = useState(() => {
    return [
      { name: 'date', title: intl.formatMessage(messages['common_date']) },
      { name: 'product', title: intl.formatMessage(messages['common_product']) },
      { name: 'pro_qta', title: intl.formatMessage(messages['common_quantity']) },
      { name: 'unit_price', title: intl.formatMessage(messages['common_price']), getCellValue: getUnitPrice },
      { name: 'amount', title: intl.formatMessage(messages['common_total']) },
    ]
  })
  const [messagesSummary] = useState(() => ({
    sum: intl.formatMessage(messages['common_total']),
  }))
  return (
    <Grid
      columns={columns}
      rows={data.entries}
    >
      <SummaryState
        totalItems={totalSummaryItems}
      />
      <IntegratedSummary/>
      <MoneyTypeProvider
        for={moneyColumns}
      />
      <SelectiveTable
        width={width}
      />
      <TableHeaderRow cellComponent={CellHeader}/>
      <TableSummaryRow messages={messagesSummary} totalCellComponent={CellSummary}/>
    </Grid>
  )
}

export default memo(withWidth()(DetailTable))
