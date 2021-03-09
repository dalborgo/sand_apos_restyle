import fileUpload from 'express-fileupload'
import Q from 'q'
import parse from 'csv-parse'
import { generalError, getControlRecord } from './utils'
import log from '@adapter/common/src/winston'
import { execTypesQuery } from '../types'
import groupBy from 'lodash/groupBy'
import isNil from 'lodash/isNil'
import isEmpty from 'lodash/isEmpty'

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
    const [controlRecordFunction, uniqueFields, toSearchFields = [], extra] = getControlRecord(firstColumns)
    if (!controlRecordFunction) {
      return res.send({ ok: false, message: 'file not recognized!', errCode: 'UNKNOWN_FILE' })
    }
    const toSkipKey = [], defaultKeys = []
    for (let { type, params, skip = [], _keys } of toSearchFields) {
      toSkipKey.push(skip)
      defaultKeys.push(_keys)
      promises.push(execTypesQuery(req, type, params))
    }
    const responses = await Promise.all(promises)
    for (let i = 0; i < responses.length; i++) {
      const { results } = responses[i]
      const [first] = results
      const keys = first ? Object.keys(first).sort() : defaultKeys[i]// ordinate alfabeticamente per essere predicibili
      for (let key of keys) {
        !toSkipKey[i].includes(key) && presenceFields.push(groupBy(results, key))
      }
    }
    const onRecord = (record, { lines: line }) => {
      const {
        checkedRecord,
        errors: rowsErrors,
      } = controlRecordFunction({ ...record, owner }, line, idFieldsMap, presenceFields, extra)
      let countRow = 0
      for (let field of uniqueFields) {
        countRow++
        if (Array.isArray(field)) {
          const keys = []
          let allVal = true
          for (let val of field) {
            keys.push(record[val])
            if (!record[val]) {allVal = false}
          }
          allVal && void (idFieldsMap[keys.join('_')] = countRow)
        } else {
          record[field] && void (idFieldsMap[record[field]] = countRow)
        }
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
    const { type } = rows[0]
    if (['PRODUCT', 'VARIANT'].includes(type)) {
      const defaultCatalog = presenceFields[4][true]
      if (!defaultCatalog) {
        generalError('', errors, '', 'MISSING_DEFAULT_CATALOG')
      } else {
        const defaultCatalogCount = defaultCatalog.length
        if (defaultCatalogCount > 1) {
          generalError('', errors, '', 'MULTI_DEFAULT_CATALOG')
        }
      }
      if (type === 'PRODUCT') {
        !extra.includes(defaultCatalog[0]['display']) && generalError('', errors, '', 'MISSING_COLUMN_DEFAULT_CATALOG', defaultCatalog[0]['display'])
      } else {
        !extra.includes(`${defaultCatalog[0]['display']}_WITH`) && generalError('', errors, '', 'MISSING_COLUMN_DEFAULT_CATALOG', `${defaultCatalog[0]['display']}_WITH`)
        !extra.includes(`${defaultCatalog[0]['display']}_WITHOUT`) && generalError('', errors, '', 'MISSING_COLUMN_DEFAULT_CATALOG', `${defaultCatalog[0]['display']}_WITHOUT`)
      }
    }
    if (errors.length) {return res.send({ ok: true, results: { stats, errors } })}
    const promises_ = [], keys = [], warnings = []
    const warehouse = {}
    for (let row of rows) {
      let _candidateKey, _isEdit, _rest
      if (row.type === 'PRODUCT') {
        const { _candidateKey: candidateKey, _isEdit: isEdit, min, instock, ...rest } = row
        if (!isNil(min) && !isNil(instock)) {warehouse[candidateKey] = { instock, min }}
        _candidateKey = candidateKey
        _isEdit = isEdit
        _rest = rest
      } else {
        const { _candidateKey: candidateKey, _isEdit: isEdit, ...rest } = row
        _candidateKey = candidateKey
        _isEdit = isEdit
        _rest = rest
      }
      keys.push({ _candidateKey, _isEdit })
      if (_isEdit) {
        promises_.push(collection.upsert(`${_candidateKey}`, _rest, { timeout: 5000 }))
      } else {
        promises_.push(collection.insert(`${_candidateKey}`, _rest, { timeout: 5000 }))
      }
    }
    if (!isEmpty(warehouse)) {
      try {
        const { content } = await collection.get(`products_warehouse_${owner}`)
        const input = Object.assign(content, warehouse)
        await collection.upsert(`products_warehouse_${owner}`, input, { timeout: 5000 })
      } catch (err) {
        const warn = {
          code: err.cause.code,
          key: err.context.key,
          message: err.message,
        }
        log.warn('Import warn', warn)
        warnings.push(warn)
      }
    }
    const executed = await Q.allSettled(promises_)
    let count = 0, totalModifications = 0, notSaved = []
    for (let { state, reason } of executed) {
      if (state === 'rejected') {
        const importError = { code: reason.cause.code, key: reason.context.key, message: reason.context.message }
        log.error('Import error', importError)
        notSaved.push(importError)
      } else {
        if (keys[count]['_isEdit']) {
          totalModifications++
        }
      }
      count++
    }
    const totalCreations = stats.records - totalModifications - notSaved.length
    res.send({
      ok: true,
      results: { stats: { ...stats, notSaved, totalCreations, totalModifications, type, warnings } },
    })
  })
  router.post('/management/export/:type', async function (req, res) {
    const { params, query } = req
    const allParams = Object.assign(params, query)
    utils.controlParameters(allParams, ['type', 'owner'])
    const { ownerArray } = utils.parseOwner(req)
    if (ownerArray.length > 1) {return res.send({ ok: false, message: 'import with multi-code is not supported!' })}
    const { type, owner } = allParams
    res.send({ ok: true })
  })
}

export default {
  addRouters,
}
