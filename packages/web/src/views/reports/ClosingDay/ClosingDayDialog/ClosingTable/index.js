import React, { memo } from 'react'
import { calculateClosingTable } from './calculation'
import { Divider, makeStyles, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { useMoneyFormatter } from 'src/utils/formatters'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'

const useStyles = makeStyles(theme => ({
  bold: props => ({
    fontWeight: props.isBold ? 'bold' : undefined,
  }),
}))
const useStylesCell = makeStyles(theme => ({
  title: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sizeSmall: {
    border: 0,
    padding: theme.spacing(0, 1),
    '&:last-child': {
      paddingRight: theme.spacing(1),
    },
  },
}), { name: 'MuiTableCell' })

const SimpleRow = ({ values, isBold = false }) => {
  const classes = useStyles({ isBold })
  useStylesCell()
  const { left, center, right } = values
  return (
    <TableRow>
      <TableCell className={classes.bold}>{left}</TableCell>
      <>
        {
          center ?
            <TableCell align="center" className={classes.bold}>{center}</TableCell>
            :
            <TableCell/>
        }
      </>
      <TableCell align="right" className={classes.bold}>{right}</TableCell>
    </TableRow>
  )
}
const TitleRow = ({ title }) => {
  const classes = useStylesCell()
  return (
    <TableRow>
      <TableCell className={classes.title} colSpan={3}>{title}</TableCell>
    </TableRow>
  )
}

function createRows (closing, incomes, post, mf, intl) {
  const tot = { num: 0, val: 0 }
  const rows = incomes.reduce((prev, curr) => {
    const { key, value } = curr
    const defKey = key || value
    const { num, display, val } = closing[`tot_${defKey}${post ? `_${post}` : ''}`] || {}
    num && prev.push(<SimpleRow key={defKey} values={{ left: display, center: num, right: mf(val) }}/>)
    tot.num += num || 0
    tot.val += val || 0
    return prev
  }, [])
  tot.num && rows.push(
    <SimpleRow
      isBold
      key="tot_modes"
      values={{ left: intl.formatMessage(messages['common_total']), center: tot.num, right: mf(tot.val) }}
    />
  )
  return rows
}

const WrapperRows = ({ closing, values, title, post }) => {
  const moneyFormatter = useMoneyFormatter()
  const intl = useIntl()
  return (
    <>
      <TitleRow title={title}/>
      <>
        {
          createRows(closing, values, post, moneyFormatter, intl).map(row => row)
        }
      </>
    </>
  )
}

function ClosingTable ({ data }) {
  const closing = data?.results
  const intl = useIntl()
  const { payment_incomes: incomes, modes } = closing
  const elab = calculateClosingTable(closing)
  const moneyFormatter = useMoneyFormatter()
  const intlTotal = intl.formatMessage(messages['common_total'])
  return (
    <>
      <Divider/>
      <Table aria-label="closing-table" size="small">
        <TableBody>
          <SimpleRow isBold values={{ left: intlTotal, right: moneyFormatter(elab['tot'].val) }}/>
          <WrapperRows closing={elab} title={intl.formatMessage(messages['common_type_document'])} values={modes}/>
          <WrapperRows closing={elab} title={intl.formatMessage(messages['common_type_payment'])} values={incomes}/>
          <WrapperRows closing={elab} post="sc" title={intl.formatMessage(messages['common_discounts'])}
                       values={modes}/>
          <TitleRow title={intl.formatMessage(messages['common_transfers'])}/>
          <SimpleRow
            isBold
            values={
              {
                left: intlTotal,
                center: elab['tot_st'].num,
                right: moneyFormatter(elab['tot_st'].val),
              }
            }
          />
        </TableBody>
      </Table>
    </>
  )
}

export default memo(ClosingTable)
