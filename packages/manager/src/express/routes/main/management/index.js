import fileUpload from 'express-fileupload'
import Q from 'q'
import parse from 'csv-parse'
import { getControlRecord } from './utils'
import log from '@adapter/common/src/winston'
import { execTypesQuery } from '../types'
import keyBy from 'lodash/keyBy'

function addRouters (router) {
  router.post('/management/import', fileUpload(), async function (req, res) {
    const { files = {} } = req, errors = [], idFieldsMap = {}, presenceFields = {}
    const file = files.file
    if (!file) {return res.send({ ok: false, message: 'no file uploaded!' })}
    const [firstLine] = await Q.nfcall(parse, file.data, { delimiter: ';', to_line: 1 })
    const [firstColumns] = firstLine
    const [controlRecordFunction, uniqueFields, presentFields, notPresentField] = getControlRecord(firstColumns)
    const types = [...presentFields, notPresentField]
    for (let { type, params } of types) {
      const { results } = await execTypesQuery(req, type, params)
      presenceFields[type] = keyBy(results, 'display')
    }
    console.log('presenceFields:', presenceFields)
    const onRecord = (record, { lines: line }) => {
      console.log('record:', record)
      
      const { checkedRecord, errors: rowsErrors } = controlRecordFunction(record, line, idFieldsMap, presenceFields)
      for (let field of uniqueFields) {
        record[field] && void (idFieldsMap[record[field]] = true)
      }
      if (rowsErrors.length) {
        errors.push(...rowsErrors)
      }
      return checkedRecord
    }
    const [rows, stats] = await Q.nfcall(parse, file.data, {
      columns: true,
      delimiter: ';',
      on_record: onRecord,
      skip_empty_lines: true,
      skip_lines_with_empty_values: true,
      trim: true,
    })
    console.log('idFieldsMap:', idFieldsMap)
    log.debug('stats', stats)
    console.log('rows:', rows)
    console.log('errors:', errors)
    res.send({ ok: true })
  })
}

export default {
  addRouters,
}
