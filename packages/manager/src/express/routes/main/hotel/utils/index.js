import { queryById } from '../../queries'
import get from 'lodash/get'
import find from 'lodash/find'
import template from 'lodash/template'
import remove from 'lodash/remove'
import includes from 'lodash/includes'
import reduce from 'lodash/reduce'

const { axios, utils } = require(__helpers)

export async function getHotelOptions (req, owner) {
  const { ok, message, results: gc, ...extra } = await queryById({
    ...req,
    body: {
      columns: ['customize_stelle_options'],
      id: `general_configuration_${owner}`,
    },
  })
  if (!ok) {return { ok, message, ...extra }}
  const {
    cast_movements_in_array: castInArray,
    headers = { 'Content-Type': 'application/json' },
    hotel_code: hotelCode,
    hotel_server: hotelServer,
    port = '',
    protocol = 'http',
    token: clientToken,
    ...rest
  } = gc
  
  return {
    ok: true,
    results: {
      castInArray,
      clientToken,
      headers,
      hotelCode,
      hotelServer,
      port,
      protocol,
      ...rest,
    },
  }
}

export async function saveHotelMenu (req, owner, toUpdate = [], toDelete = []) {
  const products = [...toUpdate]
  for (let item of toDelete) {
    if (item.ext_code !== 'pos_default_product') {
      /* eslint-disable no-unused-vars */
      const {
        description,
        net_price,
        category_id,
        vat,
        department_id,
        department_description,
        department_vat_rate,
        ext_code,
        ...rest
      } = item
      /* eslint-enable */
      rest.status = 'update'
      rest.code = ''
      products.push(rest)
    }
  }
  const hotelOptionsResponse = await getHotelOptions(req, owner)
  if (!hotelOptionsResponse.ok) {return hotelOptionsResponse}
  const { results: options } = hotelOptionsResponse
  const {
    clientToken,
    hotelCode,
    path_set_products: path,
  } = options
  
  const hotelInstance = await axios.getHotelInstance(options)
  const { data: results } = await hotelInstance.post(path, { clientToken, hotelCode, updateMode: 'byId', products })
  return { ok: true, results }
}

export async function getHotelMetadata (req, owner, filterOnlyAssociated = false) {
  const hotelOptionsResponse = await getHotelOptions(req, owner)
  if (!hotelOptionsResponse.ok) {return hotelOptionsResponse}
  const { results: options } = hotelOptionsResponse
  const {
    clientToken,
    hotelCode,
    path_get_categories: pathCategories,
    path_get_departments: pathDepartments,
    path_get_products: pathProducts,
  } = options
  const promises = []
  const paths = [pathCategories, pathDepartments, pathProducts]
  const hotelInstance = await axios.getHotelInstance(options)
  paths.forEach(path => {
    promises.push(hotelInstance.post(path, { clientToken, hotelCode }))
  })
  const [categoriesResponse, departmentsResponse, productsResponse] = await utils.allSettled(promises, true, 'response.data')
  const categories = get(categoriesResponse, 'data.categories', [])
  const departments = get(departmentsResponse, 'data.departments', [])
  const products_ = get(productsResponse, 'data.products', [])
  const products = filterOnlyAssociated ? products_.filter(product => product.ext_code) : products_
  
  return { ok: true, results: { categories, departments, products } }
}

const findStelleVatDepartment = (hotelDepartments, vatValue = '10') => {
  const found = find(hotelDepartments, ({ vat_rate }) => vat_rate.includes(String(vatValue)))
  return get(found, 'id', -1)
}

const findStelleProduct = (hotelProducts, code, description_) => find(hotelProducts, ({
  ext_code: extCode,
  description,
}) => extCode === code || description === description_)

export async function alignHotelProducts ({
  hotelOptions,
  products,
  rooms = [],
  departments = [],
  macros = [],
  hotelMetaData,
  coverPrice,
}) {
  const vatCandidate10 = findStelleVatDepartment(hotelMetaData.departments)
  const toUpdate = [], idsToDealWith = []
  toUpdate.push({
    description: 'Extra',
    net_price: 0,
    code: 'pos_default_product',
    vat_candidate: -1,
  })
  const fallback = get(hotelOptions, 'generic_product.fallback', '')
  const groupByMacro = get(hotelOptions, 'generic_product.group_by_macro', false)
  if (fallback) {
    const hasRoom = fallback.match(/<%=\s*room\s*%>/)
    if (hasRoom) {
      rooms.forEach(room => {
        const compiled = template(fallback)
        const description = compiled({ room: room.display }).trim()
        toUpdate.push({
          description,
          net_price: 0,
          vat_candidate: vatCandidate10,
          code: room.id,
        })
        idsToDealWith.push(room.id)
      })
    } else {
      toUpdate.push({
        description: fallback.trim(),
        net_price: 0,
        vat_candidate: vatCandidate10,
        code: 'stelle_fallback',// hard code
      })
      idsToDealWith.push('stelle_fallback')
    }
  } else if (groupByMacro) {
    macros.forEach(macro => {
      toUpdate.push({
        description: macro.display,
        net_price: 0,
        vat_candidate: vatCandidate10,
        code: macro.display,
      })
      idsToDealWith.push(macro.display)
    })
    const coverMacroDisplay = get(hotelOptions, 'generic_product.macro_display_covers', '')
    if (coverMacroDisplay) {
      if (!includes(idsToDealWith, coverMacroDisplay)) {
        toUpdate.push({
          description: coverMacroDisplay,
          net_price: coverPrice,
          vat_candidate: vatCandidate10,
          code: coverMacroDisplay,
        })
        idsToDealWith.push(coverMacroDisplay)
      }
    } else {
      toUpdate.push({
        description: 'Coperti',
        net_price: coverPrice,
        vat_candidate: vatCandidate10,
        code: 'covers',// hard coded
      })
      idsToDealWith.push('covers')
    }
  } else {
    toUpdate.push({
      description: 'Coperti',
      net_price: coverPrice,
      vat_candidate: vatCandidate10,
      code: 'covers',// hard coded
    })
    idsToDealWith.push('covers')
    departments.forEach(department => {
      toUpdate.push({
        description: department.product_display,
        net_price: 0,
        vat_candidate: findStelleVatDepartment(hotelMetaData.departments, department.iva),
        code: department.id,
      })
      idsToDealWith.push(department.id)
    })
    const chargeProductName = get(hotelOptions, 'charge_product_name')
    if (chargeProductName) {
      toUpdate.push({
        description: chargeProductName,
        net_price: 0,
        vat_candidate: vatCandidate10,
        code: 'charge_product_name',// hard coded
      })
      idsToDealWith.push('charge_product_name')
    }
    products.forEach(product => {
      toUpdate.push({
        description: product.display,
        net_price: product.net_price,
        vat_candidate: findStelleVatDepartment(hotelMetaData.departments, product.iva),
        code: product.id,
      })
      idsToDealWith.push(product.id)
    })
  }
  let foundStelleDefault = false
  toUpdate.forEach(item => {
    const hotelProduct = findStelleProduct(hotelMetaData.products, item.code, 'pos_default_product' === item.code ? undefined : item.description)
    if ('pos_default_product' === item.code && hotelProduct) {
      foundStelleDefault = true
    } else {
      if (hotelProduct) {
        item.status = 'update'
        item.id = hotelProduct.id
      } else {
        item.status = 'new'
        item.department_id = item.vat_candidate
      }
      delete item.vat_candidate
    }
  })
  foundStelleDefault && remove(toUpdate, { code: 'pos_default_product' })
  const toDelete = reduce(hotelMetaData.products, (prev, curr) => {
    if (curr.ext_code && curr.ext_code !== 'pos_default_product') {
      prev.push(curr)
    }
    return prev
  }, [])
  remove(toDelete, ({ ext_code: extCode }) => includes(idsToDealWith, extCode))
  return { toDelete, toUpdate }
}
