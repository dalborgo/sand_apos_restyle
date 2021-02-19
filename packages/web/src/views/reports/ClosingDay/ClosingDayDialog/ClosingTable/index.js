import React, { memo } from 'react'
import { calculateClosingTable } from './calculation'
import { Divider, makeStyles, Table, TableBody, TableCell, TableRow, useTheme } from '@material-ui/core'
import { useMoneyFormatter } from 'src/utils/formatters'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import { useGeneralStore } from 'src/zustandStore'

const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 450,
    marginBottom: theme.spacing(2),
  },
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
    padding: theme.spacing(0),
    '&:last-child': {
      paddingRight: theme.spacing(0),
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

function createRows (closing, values, pre, post, mf, intl, total) {
  const tot = { num: 0, val: 0 }
  const rows = values.reduce((prev, curr) => {
    const { key, value } = curr
    const defKey = key || value
    const { num, display, name, val } = closing[`${pre}_${defKey}${post ? `_${post}` : ''}`] || {}
    num && prev.push(<SimpleRow key={defKey} values={{ left: display || name, center: num, right: mf(val) }}/>)
    tot.num += num || 0
    tot.val += val || 0
    return prev
  }, [])
  if(total && tot.num < total.num){
    const diffNum = total.num - tot.num
    const diffVal = total.val - tot.val
    tot.num += diffNum
    tot.val += diffVal
    rows.push(<SimpleRow key="other" values={{ left: intl.formatMessage(messages['common_charge']).toUpperCase(), center: diffNum, right: mf(diffVal) }}/>)
  }
  tot.num && rows.push(
    <SimpleRow
      isBold
      key="tot_rows"
      values={{ left: intl.formatMessage(messages['common_total']), center: tot.num, right: mf(tot.val) }}
    />
  )
  return rows
}

const WrapperRows = ({ closing, values, title, pre, post, total }) => {
  const moneyFormatter = useMoneyFormatter()
  const intl = useIntl()
  const rows = createRows(closing, values, pre, post, moneyFormatter, intl, total).map(row => row)
  if(rows.length){
    return (
      <>
        <TitleRow title={title}/>
        <>
          {
            rows
          }
        </>
      </>
    )
  }else{
    return null
  }
}
const selAllIn = state => state.allIn

function ClosingTable ({ data }) {
  const classes = useStyles()
  const allIn = useGeneralStore(selAllIn)
  const closing = data?.results
  const intl = useIntl()
  const theme = useTheme()
  const side = allIn ? 'red' : 'blue'
  const { payment_incomes: incomes, modes, operators } = closing?.[side]
  const elab = calculateClosingTable(closing?.[side])
  const moneyFormatter = useMoneyFormatter()
  const intlTotal = intl.formatMessage(messages['common_total'])
  console.log('incomes:', incomes)
  return (
    <>
      <Table aria-label="closing-table" className={classes.table} size="small">
        <TableBody>
          {
            operators.map(({ user }) => {
              const total = {num: elab[user].num || 0, val: elab[user].val || 0}
              console.log('total:', total)
              if (total.num) {
                return (
                  <React.Fragment key={user}>
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        style={{ padding: theme.spacing(1, 0) }}
                      >
                        <Divider/>
                      </TableCell>
                    </TableRow>
                    <SimpleRow isBold values={{ left: user.toUpperCase(), right: moneyFormatter(elab[user].val) }}/>
                    <WrapperRows
                      closing={elab}
                      pre={user}
                      title={intl.formatMessage(messages['common_type_document'])}
                      values={modes}
                    />
                    <WrapperRows
                      closing={elab}
                      pre={user}
                      title={intl.formatMessage(messages['common_type_payment'])}
                      total={total}
                      values={incomes}
                    />
                    {
                      Boolean(elab[`${user}_st`].num) &&
                      <>
                        <WrapperRows
                          closing={elab}
                          post="sc"
                          pre={user}
                          title={intl.formatMessage(messages['common_discounts'])}
                          values={modes}
                        />
                      </>
                    }
                    {
                      Boolean(elab[`${user}_st`].num) &&
                      <>
                        <TitleRow title={intl.formatMessage(messages['common_reversals'])}/>
                        <SimpleRow
                          isBold
                          values={
                            {
                              left: intlTotal,
                              center: elab[`${user}_st`].num,
                              right: moneyFormatter(elab[`${user}_st`].val),
                            }
                          }
                        />
                      </>
                    }
                  </React.Fragment>
                )
              } else {
                return null
              }
            })
          }
        </TableBody>
      </Table>
    </>
  )
}

export default memo(ClosingTable)
