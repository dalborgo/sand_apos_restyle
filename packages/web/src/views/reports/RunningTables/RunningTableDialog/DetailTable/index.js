import React, { memo, useState } from 'react'
import { Grid, Table, TableHeaderRow, TableSummaryRow } from '@devexpress/dx-react-grid-material-ui'
import { messages } from 'src/translations/messages'
import { useIntl } from 'react-intl'
import { Cell, CellHeader, CellSummary } from './comps'
import { MoneyTypeProvider } from 'src/utils/tableFormatters'
import { IntegratedSummary, SummaryState } from '@devexpress/dx-react-grid'

const tableColumnExtensions = [
  { columnName: 'pro_qta', align: 'right' },
  { columnName: 'amount', align: 'right' },
  { columnName: 'unit_price', align: 'right' },
]

const totalSummaryItems = [
  { columnName: 'amount', type: 'sum' },
]

function addCoverEntry (data, coverDisplay) {
  const { entries, covers, cover_price: coverPrice, creation_date, user } = data
  if (covers) {
    return [{
      date: creation_date,
      pro_qta: covers,
      amount: coverPrice * covers,
      user,
      pro_display: coverDisplay,
    }, ...entries]
  } else {
    return entries
  }
}

const getUnitPrice = ({ amount, pro_qta: proQta }) => amount / proQta
const moneyColumns = ['amount', 'unit_price']

function DetailTable ({ data }) {
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
  const entries = addCoverEntry(data, intl.formatMessage(messages['common_covers'])) //ok no useState
  return (
    <Grid
      columns={columns}
      rows={entries}
    >
      <SummaryState
        totalItems={totalSummaryItems}
      />
      <IntegratedSummary/>
      <MoneyTypeProvider
        for={moneyColumns}
      />
      <Table
        cellComponent={Cell}
        columnExtensions={tableColumnExtensions}
      />
      <TableHeaderRow cellComponent={CellHeader}/>
      <TableSummaryRow messages={messagesSummary} totalCellComponent={CellSummary}/>
    </Grid>
  )
}

export default memo(DetailTable)
