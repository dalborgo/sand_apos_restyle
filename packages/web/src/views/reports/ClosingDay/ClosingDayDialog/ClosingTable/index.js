import React, { memo } from 'react'
import { calculateClosingTable } from './calculation'
import { Divider, makeStyles, Table, TableBody, TableCell, TableRow } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  bold: props => ({
    fontWeight: props.isBold ? 'bold' : undefined,
  }),
}))
const useStylesCell = makeStyles({
  title: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sizeSmall: {
    border: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 10,
    '&:last-child': {
      paddingRight: 10,
    },
  },
}, { name: 'MuiTableCell' })

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
const DocumentRows = ({ data }) => {
  return (
    <TitleRow title={'Tipo di Documento'}/>
  )
}

function ClosingTable ({ data }) {
  const closing = data?.results
  console.log('%cRENDER_', 'color: green')
  const elab = calculateClosingTable(closing)
  return (
    <>
      <Divider/>
      <Table aria-label="closing-table" size="small">
        <TableBody>
          <SimpleRow isBold values={{ left: 'TOTALE', right: elab['tot'].val }}/>
          <DocumentRows data={elab}/>
        </TableBody>
      </Table>
      {JSON.stringify(elab, null, 2)}
    </>
  )
}

export default memo(ClosingTable)
