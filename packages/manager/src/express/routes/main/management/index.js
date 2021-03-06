import fileUpload from 'express-fileupload'
import Q from 'q'
import parse from 'csv-parse'
import { writeToBuffer } from '@fast-csv/format'
import { generalError, getControlRecord } from './utils'
import log from '@adapter/common/src/winston'
import { execTypesQuery } from '../types'
import groupBy from 'lodash/groupBy'
import isNil from 'lodash/isNil'
import isEmpty from 'lodash/isEmpty'
import keyBy from 'lodash/keyBy'
import get from 'lodash/get'
import { couchQueries } from '@adapter/io'
import { Iconv } from 'iconv'

const knex = require('knex')({ client: 'mysql' })

const { utils } = require(__helpers)

function addRouters (router) {
  router.post('/management/import', fileUpload(), async function (req, res) {
    const { files = {}, connClass, query } = req, errors = [], idFieldsMap = {}, presenceFields = [], promises = []
    utils.checkParameters(query, ['owner'])
    const { startOwner: owner, ownerArray } = utils.parseOwner(req)
    if (ownerArray.length > 1) {return res.send({ ok: false, message: 'import with multi-code is not supported!' })}
    const file = files.file
    
    const fileDecoded = Iconv('WINDOWS-1252', 'utf8').convert(file.data)
    if (!file) {return res.send({ ok: false, message: 'no file uploaded!' })}
    const [firstLine] = await Q.nfcall(parse, fileDecoded, { delimiter: ';', to_line: 1 })
    const [firstColumns] = firstLine
    if (!firstColumns) {return res.send({ ok: false, message: 'header missing!', errCode: 'HEADER_MISSING' })}
    const [controlRecordFunction, uniqueFields, toSearchFields = [], extra] = getControlRecord(firstColumns)
    if (!controlRecordFunction) {
      return res.send({
        ok: false,
        message: 'file not recognized!',
        errCode: 'UNKNOWN_FILE',
      })
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
    const countArr = uniqueFields.map(() => 2)
    const onRecord = (record, { lines: line }) => {
      const {
        checkedRecord,
        errors: rowsErrors,
      } = controlRecordFunction({ ...record, owner }, line, idFieldsMap, presenceFields, extra)
      for (let i = 0; i < uniqueFields.length; i++) {
        const field = uniqueFields[i]
        if (Array.isArray(field)) {
          const keys = []
          let allVal = true
          for (let val of field) {
            keys.push(record[val])
            if (!record[val]) {allVal = false}
          }
          allVal && void (idFieldsMap[keys.join('_')] = countArr[i]++)
        } else {
          record[field] && void (idFieldsMap[record[field]] = countArr[i]++)
        }
      }
      if (rowsErrors.length) {
        errors.push(...rowsErrors)
      }
      return checkedRecord
    }
    const { astenposBucketCollection: collection } = connClass
    const [rows, stats] = await Q.nfcall(parse, fileDecoded, {
      columns: true,
      delimiter: ';',
      on_record: onRecord,
      skip_empty_lines: true,
      skip_lines_with_empty_values: true,
      trim: true,
    })
    log.debug('stats', stats)
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
        const warn = { code: err.cause.code, key: err.context.key, message: err.message }
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
    const { params, query, connClass } = req
    const { astenposBucketName: bucketName, astenposBucketCollection: collection } = connClass
    const allParams = Object.assign(params, query)
    utils.checkParameters(allParams, ['type', 'owner'])
    const { ownerArray, queryCondition } = utils.parseOwner(req, 'buc')
    if (ownerArray.length > 1) {return res.send({ ok: false, message: 'import with multi-code is not supported!' })}
    const { type, owner } = allParams
    let rows = [], headers, transform = null, warehouse = {}
    switch (type) {
      case 'TABLE': {
        const statement = knex({ buc: bucketName })
          .select(knex.raw('meta(buc).id table_id, buc.display, buc.short_display, room.display room, buc.`index`, buc.rgb[0] r, buc.rgb[1] g, buc.rgb[2] b'))
          .joinRaw(`LEFT JOIN \`${bucketName}\` room ON KEYS buc.room`)
          .where({ 'buc.type': type })
          .where(knex.raw(queryCondition))
          .orderBy('buc.index')
          .toQuery()
        const { ok, results, message, err } = await couchQueries.exec(statement, connClass.cluster)
        if (!ok) {return res.status(412).send({ ok, message, err })}
        headers = ['table_id', 'display', 'short_display', 'room', 'r', 'g', 'b', 'index']
        rows = results
        break
      }
      case 'CATEGORY': {
        const statement = knex({ buc: bucketName })
          .select(knex.raw('meta(buc).id category_id, buc.display, buc.short_display, macro.display macro, buc.`index`, buc.rgb[0] r, buc.rgb[1] g, buc.rgb[2] b'))
          .joinRaw(`LEFT JOIN \`${bucketName}\` macro ON KEYS buc.macro`)
          .where({ 'buc.type': type })
          .where(knex.raw(queryCondition))
          .orderBy('buc.index')
          .toQuery()
        const { ok, results, message, err } = await couchQueries.exec(statement, connClass.cluster)
        if (!ok) {return res.status(412).send({ ok, message, err })}
        headers = ['category_id', 'display', 'short_display', 'macro', 'r', 'g', 'b', 'index']
        rows = results
        break
      }
      case 'CUSTOMER': {
        const statement = knex({ buc: bucketName })
          .select(knex.raw('meta().id customer_id, company,  address, city, prov, zip_code, state, iva, cf'))
          .where({ type })
          .where(knex.raw(queryCondition))
          .toQuery()
        const { ok, results, message, err } = await couchQueries.exec(statement, connClass.cluster)
        if (!ok) {return res.status(412).send({ ok, message, err })}
        headers = ['customer_id', 'company', 'address', 'city', 'prov', 'zip_code', 'state', 'iva', 'cf']
        rows = results
        break
      }
      case 'CUSTOMER_ADDRESS': {
        const statement = knex({ buc: bucketName })
          .select(knex.raw('meta().id customer_address_id, surname, name, phone, mail, address, city, zip, code, intern'))
          .where({ type })
          .where(knex.raw(queryCondition))
          .toQuery()
        const { ok, results, message, err } = await couchQueries.exec(statement, connClass.cluster)
        if (!ok) {return res.status(412).send({ ok, message, err })}
        headers = ['customer_address_id', 'surname', 'name', 'phone', 'mail', 'address', 'city', 'zip', 'code', 'intern']
        rows = results
        break
      }
      case 'PRODUCT': {
        const { ok, results, message, err } = await execTypesQuery(req, 'CATALOG', { order: ['index'] })
        if (!ok) {return res.status(412).send({ ok, message, err })}
        const catalogHeader = results.map(({ display }) => display)
        headers = ['product_id', 'display', 'short_display', 'category', 'r', 'g', 'b', 'department', 'index', 'disabled', 'hidden', 'preferred', 'instock', 'min', 'sku', ...catalogHeader]
        try {
          const { content } = await collection.get(`products_warehouse_${owner}`, { timeout: 3000 })
          warehouse = content
        } catch (err) {
          const warn = { code: err.cause.code, key: err.context.key, message: err.message }
          log.warn('Import warn', warn)
        }
        transform = row => {
          const { prices, ...rest } = row
          const pricesByKey = keyBy(prices, 'catalog')
          return {
            ...rest,
            disabled: rest.disabled ? 'ok' : '',
            hidden: rest.hidden ? 'ok' : '',
            instock: get(warehouse, `[${row.product_id}].instock`),
            min: get(warehouse, `[${row.product_id}].min`),
            ...results.reduce((prev, catalog) => {
              const { _id, display } = catalog
              prev[display] = get(pricesByKey, `[${_id}].price`)
              return prev
            }, {}),
            preferred: rest.preferred ? 'ok' : '',
          }
        }
        {
          const statement = knex({ buc: bucketName })
            .select(knex.raw('meta(buc).id product_id, buc.display, buc.short_display, cat.display category, dep.`index` department, buc.`index`, buc.rgb[0] r, buc.rgb[1] g, buc.rgb[2] b, buc.disabled, buc.hidden, buc.preferred, buc.sku, buc.prices'))
            .joinRaw(`LEFT JOIN \`${bucketName}\` cat ON KEYS buc.category LEFT JOIN \`${bucketName}\` dep ON KEYS buc.vat_department_id`)
            .where({ 'buc.type': type })
            .where(knex.raw(queryCondition))
            .orderBy('buc.index')
            .toQuery()
          const { ok, results, message, err } = await couchQueries.exec(statement, connClass.cluster)
          if (!ok) {return res.status(412).send({ ok, message, err })}
          rows = results
        }
        break
      }
      case 'VARIANT': {
        const { ok, results, message, err } = await execTypesQuery(req, 'CATALOG', { order: ['index'] })
        if (!ok) {return res.status(412).send({ ok, message, err })}
        const catalogHeader = results.reduce((prev, { display }) => {
          prev.push(`${display}_WITH`)
          prev.push(`${display}_WITHOUT`)
          return prev
        }, [])
        headers = ['variant_id', 'display', 'short_display', 'category', 'r', 'g', 'b', 'index', 'option', ...catalogHeader]
        transform = row => {
          const { prices, ...rest } = row
          const pricesByKey = keyBy(prices, 'catalog')
          return {
            ...rest,
            ...results.reduce((prev, catalog) => {
              const { _id, display } = catalog
              prev[`${display}_WITH`] = get(pricesByKey, `[${_id}].price_with`)
              prev[`${display}_WITHOUT`] = get(pricesByKey, `[${_id}].price_without`)
              return prev
            }, {}),
          }
        }
        {
          const statement = knex({ buc: bucketName })
            .select(knex.raw('meta(buc).id variant_id, buc.display, buc.short_display, cat.display category, buc.`index`, buc.`option`, buc.rgb[0] r, buc.rgb[1] g, buc.rgb[2] b, buc.prices'))
            .joinRaw(`LEFT JOIN \`${bucketName}\` cat ON KEYS buc.category`)
            .where({ 'buc.type': type })
            .where(knex.raw(queryCondition))
            .orderBy('buc.index')
            .toQuery()
          const { ok, results, message, err } = await couchQueries.exec(statement, connClass.cluster)
          if (!ok) {return res.status(412).send({ ok, message, err })}
          rows = results
        }
        break
      }
      default:
        return res.status(412).send({ ok: false, message: 'file not recognized!', errCode: 'UNKNOWN_FILE' })
    }
    const buffer = await writeToBuffer(rows, {
      alwaysWriteHeaders: true,
      delimiter: ';',
      headers,
      transform,
      writeHeaders: true,
    })
    const fileDecoded = Iconv('utf8', 'WINDOWS-1252').convert(buffer)
    res.send(fileDecoded)
  })
  router.post('/management/count/:type', async function (req, res) {
    const { params, query, connClass } = req
    const { astenposBucketName: bucketName } = connClass
    const allParams = Object.assign(params, query)
    utils.checkParameters(allParams, ['type', 'owner'])
    const { ownerArray, queryCondition } = utils.parseOwner(req, 'buc')
    if (ownerArray.length > 1) {return res.send({ ok: false, message: 'import with multi-code is not supported!' })}
    const { type } = allParams
    const statement = knex({ buc: bucketName })
      .select(knex.raw('raw count(*)'))
      .where({ 'buc.type': type })
      .where(knex.raw(queryCondition))
      .toQuery()
    const { ok, results, message, err } = await couchQueries.exec(statement, connClass.cluster)
    if (!ok) {return res.send({ ok, message, err })}
    const [count] = results
    res.send({ ok, results: count })
  })
  router.post('/management/delete_all/:type', async function (req, res) {
    const { params, query, connClass } = req
    const { astenposBucketName: bucketName } = connClass
    const allParams = Object.assign(params, query)
    utils.checkParameters(allParams, ['type', 'owner'])
    const { ownerArray } = utils.parseOwner(req, 'buc')
    if (ownerArray.length > 1) {return res.send({ ok: false, message: 'import with multi-code is not supported!' })}
    const { type, owner } = allParams
    const statement = `delete from \`${bucketName}\` where type = "${type}" and owner ="${owner}" RETURNING meta().id`
    const { ok, results, message, err } = await couchQueries.exec(statement, connClass.cluster)
    if (!ok) {return res.send({ ok, message, err })}
    res.send({ ok, results: results.length })
  })
}

export default {
  addRouters,
}
