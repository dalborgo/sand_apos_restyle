import fileUpload from 'express-fileupload'
import Q from 'q'
import parse from 'csv-parse'
import { getControlRecord } from './utils'
import log from '@adapter/common/src/winston'
import { execTypesQuery } from '../types'
import keyBy from 'lodash/keyBy'

const { utils } = require(__helpers)

function addRouters (router) {
  router.post('/management/import', fileUpload(), async function (req, res) {
    const { files = {}, connClass, query } = req, errors = [], idFieldsMap = {}, presenceFields = [], promises = []
    utils.controlParameters(query, ['owner'])
    const { startOwner: owner, ownerArray } = utils.parseOwner(req)
    if (ownerArray.length > 1) {return res.send({ ok: false, message: 'import with multi-code is not supported!' })}
    const file = files.file
    if (!file) {return res.send({ ok: false, message: 'no file uploaded!' })}
    const [firstLine] = await Q.nfcall(parse, file.data, { delimiter: ';', to_line: 1 })
    const [firstColumns] = firstLine
    const [controlRecordFunction, uniqueFields, toSearchFields = []] = getControlRecord(firstColumns)
    for (let { type, params } of toSearchFields) {promises.push(execTypesQuery(req, type, params))}
    const responses = await Promise.all(promises)
    for (let i = 0; i < responses.length; i++) {
      const { results } = responses[i]
      presenceFields.push(keyBy(results, 'display'))
    }
    const onRecord = (record, { lines: line }) => {
      const {
        checkedRecord,
        errors: rowsErrors,
      } = controlRecordFunction({ ...record, owner }, line, idFieldsMap, presenceFields)
      for (let field of uniqueFields) {
        record[field] && void (idFieldsMap[record[field]] = true)
      }
      if (rowsErrors.length) {
        errors.push(...rowsErrors)
      }
      return checkedRecord
    }
    const { astenposBucketCollection: collection } = connClass
    const [rows, stats] = await Q.nfcall(parse, file.data, {
      columns: true,
      delimiter: ';',
      on_record: onRecord,
      skip_empty_lines: true,
      skip_lines_with_empty_values: true,
      trim: true,
    })
    log.debug('stats', stats)
    console.log('errors:', errors)
    if (!rows.length) {return res.send({ ok: false, message: 'empty file!', errCode: 'EMPTY_FILE' })}
    if (errors.length) {return res.send({ ok: true, results: { stats, errors } })}
    const promises_ = []
    const keys = []
    for (let row of rows) {
      const { candidateKey, ...rest } = row
      keys.push(candidateKey)
      promises_.push(collection.upsert(`${candidateKey}`, rest, { timeout: 5000 }))
    }
    const executed = await Promise.all(promises_)
    let count = 0
    const notSaved = executed.reduce((errorsCount, curr) => {
      if (!curr.cas) {
        log.error(keys[count])
        errorsCount++
      }
      count++
      return errorsCount
    }, 0)
    res.send({ ok: true, results: { stats: {...stats, notSaved } } })
  })
}

export default {
  addRouters,
}
