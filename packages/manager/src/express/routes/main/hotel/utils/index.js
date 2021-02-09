import { queryById } from '../../queries'
import get from 'lodash/get'

const { axios, utils } = require(__helpers)

export async function getHotelOptions (connClass, owner) {
  const { ok, message, results: gc, ...extra } = await queryById({
    connClass,
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
  } = get(gc, 'customize_stelle_options', {})
  
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

export async function saveHotelMenu (connClass, owner, toUpdate = [], toDelete = []) {
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
  const hotelOptionsResponse = await getHotelOptions(connClass, owner)
  if (!hotelOptionsResponse.ok) {return hotelOptionsResponse}
  const { results: options } = hotelOptionsResponse
  const {
    clientToken,
    hotelCode,
    path_set_products: path,
  } = options
  
  const hotelInstance = await axios.getHotelInstance(options)
  const { data: results } = await hotelInstance.post(path, { clientToken, hotelCode })
  return { ok: true, results }
}

export async function getHotelMetadata (connClass, owner, filterOnlyAssociated = false) {
  const hotelOptionsResponse = await getHotelOptions(connClass, owner)
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
  const [categoriesResponse, departmentsResponse, productsResponse] = await utils.allSettled(promises)
  const categories = get(categoriesResponse, 'data.categories', [])
  const departments = get(departmentsResponse, 'data.departments', [])
  const products_ = get(productsResponse, 'data.products', [])
  const products = filterOnlyAssociated ? products_.filter(product => product.ext_code) : products_
  
  return { ok: true, results: { categories, departments, products } }
}
