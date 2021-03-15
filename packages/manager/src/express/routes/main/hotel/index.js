import axios from 'axios'
import get from 'lodash/get'
import log from '@adapter/common/src/winston'
import findIndex from 'lodash/findIndex'
import { reqAuthGet, reqAuthPost } from '../../basicAuth'
import keyBy from 'lodash/keyBy'
import template from 'lodash/template'
import reduce from 'lodash/reduce'
import moment from 'moment'
import { alignHotelProducts, getHotelMetadata, getHotelOptions, saveHotelMenu } from './utils'
import { execTypesQuery } from '../types'
import { couchQueries } from '@adapter/io'

const knex = require('knex')({ client: 'mysql' })
const { utils } = require(__helpers)

function addRouters (router) {
  router.get('/hotel/movements', reqAuthGet, async function (req, res) {
    const { query } = req
    req.headers.internalcall = 1// skip jwt check
    utils.checkParameters(query, ['date_from', 'date_to', 'owner'])
    const { date_from: dateFrom, date_to: dateTo, active_checkins_only: activeOnly_, owner } = query
    const activeOnly = activeOnly_ && activeOnly_ !== 'false'
    const hotelOptionsResponse = await getHotelOptions(req, owner)
    if (!hotelOptionsResponse.ok) {return res.send(hotelOptionsResponse)}
    const {
      castInArray,
      clientToken,
      headers,
      hotelCode,
      hotelServer,
      path_movements: path,
      port,
      protocol,
      sgs,
    } = hotelOptionsResponse.results
    let getMovements = {
      active_checkins_only: Boolean(activeOnly),
      date_from: dateFrom,
      date_to: dateTo,
      add_extra: true,
    }
    if (castInArray) {getMovements = [getMovements]}
    const data = { clientToken, hotelCode, get_movements: getMovements }
    const url = `${protocol}://${hotelServer}${port ? `:${port}` : ''}${path}`
    log.debug('hotel movements url:', url)
    const config = { method: 'post', url, headers, data }
    const results = []
    const { data: { movements } } = await axios(config)
    for (let movement of movements) {
      // eslint-disable-next-line no-unused-vars
      const { day_prices, customers, ...parent } = movement
      for (let customer of customers) {
        if (movement.room_code) {
          const reservationHolder = findIndex(movement.reservation_holders, value => value.pms_customer_id === customer.pms_customer_id) > -1
          if (sgs) {
            parent.breakfast = true
            parent.lunch = parent.service_type === 'FB'
            parent.dinner = parent.service_type === 'FB' || parent.service_type === 'HB'
            parent.all_inclusive = false
          }
          const master = sgs ? customer.IntestatarioSN : !('pms_familyRep_id' in customer)
          const item = {
            customer,
            master: Boolean(master),
            name: customer.name || '',
            parent,
            pms_customer_id: customer.pms_customer_id,
            reservation_holder: reservationHolder,
            room_code: movement.room_code,
            room_number: movement.room_number ? movement.room_number : movement.room_code,
            surname: customer.surname || '',
          }
          if (sgs && activeOnly) {
            (customer.checkin_effective && !customer.checkout_effective) && results.push(item)
          } else {
            results.push(item)
          }
        }
      }
    }
    res.send({ ok: true, results: results })
  })
  
  router.post('/hotel/charge', reqAuthPost, async function (req, res) {
    const { body, query } = req
    req.headers.internalcall = 1// skip jwt check
    const allParams = Object.assign(body, query)
    utils.checkParameters(allParams, ['item', 'owner'])
    const { item: printDoc, owner } = allParams
    const COVERS_LABEL = 'Coperti', FALLBACK_LABEL = 'stelle_fallback', charges = []
    const hotelOptionsResponse = await getHotelOptions(req, owner)
    if (!hotelOptionsResponse.ok) {return res.send(hotelOptionsResponse)}
    const {
      clientToken,
      generic_product: genericProduct,
      headers,
      hotelCode,
      hotelServer,
      macro_display_covers: macroDisplayCovers_,
      path_charges: path,
      port,
      print_stelle_price_0,
      protocol,
      split_total_per_cover,
    } = hotelOptionsResponse.results
    
    const splitTotalPerCover = Boolean(split_total_per_cover)
    const printStellePriceZero = Boolean(print_stelle_price_0)
    const macroDisplayCovers = macroDisplayCovers_ || COVERS_LABEL
    const fallbackTemplate = get(genericProduct, 'fallback', '')
    const groupByMacro = get(genericProduct, 'group_by_macro', false)
    const fallbackCode = fallbackTemplate.match(/<%=\s*room\s*%>/) ? printDoc._id : FALLBACK_LABEL
    const compiled = template(fallbackTemplate)
    const fallback = compiled({ room: printDoc.room_name }).trim()
    const entities = keyBy(get(printDoc, 'entries'), 'id')
    const income = {
      charge_id: String(printDoc.number),
      room_code: printDoc.stelle_room,
      date: moment().toISOString(),
    }
    if (printDoc.pms_customer_id) {income.pms_customer_id = parseInt(printDoc.pms_customer_id, 10)}
    
    const saleItems = []
    const groupItems = {}
    let total = printDoc.cover_price * printDoc.covers
    if (total) {
      saleItems.push({
        quantity: printDoc.covers,
        product_description: 'Coperti',
        product_code: 'cover',// hardcoded
        unit_price: parseFloat((printDoc.cover_price / 1000).toString()),
      })
      groupItems[macroDisplayCovers] = {
        quantity: 1,
        unit_price: parseFloat((printDoc.cover_price * printDoc.covers / 1000).toString()),
        id: 'covers', // hardcoded
      }
    }
    for (let entity in entities) {
      if (entities[entity].product_qta === 0) {continue}
      let item = {}
      const c1 = { price: entities[entity].product_price * entities[entity].product_qta }
      const c2 = {
        total: reduce(entities[entity].orderVariants, function (sum, curr) {
          return curr.variant_price * curr.variant_qta * entities[entity].product_qta + sum
        }, 0),
      }
      total += c1.price + c2.total
      item.quantity = entities[entity].product_qta
      item.product_description = entities[entity].product_display
      item.product_code = entities[entity].product_id
      const totPrice = entities[entity].product_price + c2.total / entities[entity].product_qta
      item.unit_price = parseFloat((totPrice / 1000).toString())
      if (totPrice || printStellePriceZero) {
        saleItems.push(item)
        if (groupItems[entities[entity].product_macro_display]) {
          groupItems[entities[entity].product_macro_display].quantity = 1 // altrimenti moltiplica per il unit_price
          groupItems[entities[entity].product_macro_display].unit_price += item.unit_price * item.quantity
          groupItems[entities[entity].product_macro_display].id = entities[entity].product_macro_display
        } else {
          groupItems[entities[entity].product_macro_display] = {
            quantity: 1,
            unit_price: item.unit_price * item.quantity,
            id: entities[entity].product_macro_display,
          }
        }
      }
    }
    let saleItemsCorp = []
    for (let group in groupItems) {
      saleItemsCorp.push({
        quantity: splitTotalPerCover && printDoc.covers > 1 ? printDoc.covers : groupItems[group].quantity,
        product_description: group,
        product_code: groupItems[group].id,
        unit_price: splitTotalPerCover && printDoc.covers > 1 ? groupItems[group].unit_price / printDoc.covers : groupItems[group].unit_price,
      })
    }
    income.sale_items = saleItems
    income.final_amount = parseFloat((printDoc.final_price / 1000).toString())
    if (fallback) {
      income.sale_items = []
      if (splitTotalPerCover && printDoc.covers > 1) {
        income.sale_items.push({
          product_description: fallback,
          product_code: fallbackCode,
          quantity: printDoc.covers,
          unit_price: parseFloat((printDoc.final_price / (printDoc.covers * 1000)).toString()),
        })
      } else {
        income.sale_items = [{
          product_description: fallback,
          product_code: fallbackCode,
          quantity: 1,
          unit_price: income.final_amount,
        }]
      }
    }
    if (groupByMacro) {income.sale_items = saleItemsCorp}
    charges.push(income)
    log.info('charges', charges)
    const url = `${protocol}://${hotelServer}${port}${path}`
    log.debug('Charge url:', url)
    const data = { charges, clientToken, hotelCode }
    const config = { method: 'post', url, headers, data }
    const { data: response = {} } = await axios(config)
    if (Array.isArray(response.received_charges)) {
      const [receivedCharges] = response.received_charges
      log.info('Charge response', receivedCharges)
      const [firstCharge] = charges
      const result = receivedCharges[firstCharge.charge_id]
      const errCode = result
      let errObj
      switch (result) {
        case '1':
          return res.send({ ok: true })
        case '2':
          errObj = { ok: false, message: 'Default product not set!', errCode }
          break
        case '3':
          errObj = {
            ok: false,
            message: `No checked in reservation was found in the room (no. ${firstCharge.room_code}) the extra was charged to!`,
            errCode,
          }
          break
        case '4':
          errObj = { ok: false, message: `Date is older than 24 hours: ${firstCharge.date}`, errCode }
          break
        case '5':
          errObj = { ok: false, message: 'Internal Server Error, charge not saved!', errCode }
          break
        default:
          errObj = { ok: false, message: 'Undefined charge error!', errCode }
      }
      log.error('Error charge response', JSON.stringify(errObj, null, 2)) // stringify cause inside there's the reserved `message` word
      return res.send(errObj)
    } else {
      return res.send({ ok: false, message: 'Invalid charge response!', errCode: '100' })
    }
  })
  router.post('/hotel/save_menu', reqAuthPost, async function (req, res) {
    const { body, query } = req
    req.headers.internalcall = 1// skip jwt check
    const allParams = Object.assign(body, query)
    utils.checkParameters(allParams, ['data', 'conf', 'owner'])
    const { data: items, conf: saveConf, owner } = allParams
    if (!Array.isArray(items) || !items.length) {return res.send({ ok: true, results: [] })}
    const toUpdate = [], toDelete = []
    for (let item of items) {
      const { to_save: toSave, delete: isDeleted } = item
      if (toSave) {
        const row = {
          category_id: item.category_id,
          code: item.ext_code || '',
          department_id: item.department_id,
          id: item.id,
          status: item.status,
        }
        if (saveConf.save_price) { row.net_price = item.net_price }
        if (saveConf.save_description) {row.description = item.description}
        if (isDeleted) {
          toDelete.push(row)
        } else {
          toUpdate.push(row)
        }
      }
    }
    const data = await saveHotelMenu(req, owner, toUpdate, toDelete)
    res.send(data)
  })
  router.get('/hotel/metadata', reqAuthGet, async function (req, res) {
    const { query } = req
    req.headers.internalcall = 1// skip jwt check
    utils.checkParameters(query, ['owner'])
    const { owner } = query
    const response = await getHotelMetadata(req, owner)
    res.send(response)
  })
  router.get('/hotel/align_preview', async function (req, res) {
    const { query, connClass } = req
    utils.checkParameters(query, ['owner'])
    const { startOwner: owner, ownerArray, queryCondition } = utils.parseOwner(req, 'buc')
    if (ownerArray.length > 1) {return res.send({ ok: false, message: 'import with multi-code is not supported!' })}
    const partial = {}
    
    const bucketName = connClass.astenposBucketName
    const generalConfigQuery = knex.from(knex.raw(`\`${bucketName}\` buc USE KEYS 'general_configuration_${owner}'`))
      .select(knex.raw('buc.charge_product_name, buc.customize_stelle_options.*'))
      .toQuery()
    const productsQuery = knex.from(knex.raw(`\`${bucketName}\` buc UNNEST buc.prices pr`))
      .select(knex.raw('meta(buc).id id, buc.display, dep.iva, pr.price/1000 net_price'))
      .joinRaw(`LEFT JOIN \`${bucketName}\` dep ON KEYS buc.vat_department_id`)
      .joinRaw(`LEFT JOIN \`${bucketName}\` cat ON KEYS buc.catalog`)
      .where({ 'buc.type': 'PRODUCT' })
      .where(knex.raw(queryCondition))
      .toQuery()
    const departmentsQuery = knex({ buc: bucketName })
      .select(knex.raw('meta(buc).id id, buc.product_display, dep.iva'))
      .joinRaw(`LEFT JOIN \`${bucketName}\` dep ON KEYS buc.vat_department`)
      .where({ 'buc.type': 'DEPARTMENT' })
      .where(knex.raw(queryCondition))
      .toQuery()
    const coverPriceQuery = knex({ buc: bucketName })
      .select(knex.raw('cover_price'))
      .where({ 'buc.type': 'CATALOG' })
      .where(knex.raw('`default` = true'))
      .where(knex.raw(queryCondition))
      .toQuery()
    
    const promises = [
      await getHotelMetadata(req, owner),
      await execTypesQuery(req, 'ROOM', { idLabel: 'id' }),
      await execTypesQuery(req, 'MACRO', { idLabel: 'id' }),
      await couchQueries.exec(departmentsQuery, connClass.cluster),
      await couchQueries.exec(productsQuery, connClass.cluster),
      await couchQueries.exec(generalConfigQuery, connClass.cluster),
      await couchQueries.exec(coverPriceQuery, connClass.cluster),
    ]
    const [metaDataResp, roomResp, macrosResp, departmentResp, productsResponse, hotelOptionsResponse, coverPriceResponse] = await Promise.all(promises)
    //if (!ok) {return res.status(412).send({ ok, message, err })}
    {
      if (!metaDataResp.ok) {return res.send(metaDataResp)}
      const { categories, departments, products } = metaDataResp.results
      partial.hotelMetaData = {
        categories: keyBy(categories, 'id'),
        departments: keyBy(departments, 'id'),
        products: keyBy(products, 'id'),
      }
      if (!roomResp.ok) {return res.send(roomResp)}
      partial.rooms = roomResp.results
      
      if (!macrosResp.ok) {return res.send(macrosResp)}
      partial.macros = macrosResp.results
      
      if (!departmentResp.ok) {return res.send(departmentResp)}
      partial.departments = departmentResp.results
      
      if (!productsResponse.ok) {return res.send(productsResponse)}
      partial.products = productsResponse.results
      
      if (!hotelOptionsResponse.ok) {return res.send(hotelOptionsResponse)}
      partial.hotelOptions = hotelOptionsResponse.results
      
      if (!coverPriceResponse.ok) {return res.send(coverPriceResponse)}
      const [{ cover_price: coverPrice }] = coverPriceResponse.results
      partial.coverPrice = coverPrice ? (parseInt(coverPrice, 10) / 1000) : 0
    }
    const {toDelete, toUpdate} = await alignHotelProducts(partial)
    res.send({ ok: true, results: [...toUpdate, ...toDelete] })
  })
}

export default {
  addRouters,
}
