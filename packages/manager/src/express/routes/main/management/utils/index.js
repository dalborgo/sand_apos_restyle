import deburr from 'lodash/deburr'
import get from 'lodash/get'
import isNaN from 'lodash/isNaN'
import isNumber from 'lodash/isNumber'
import find from 'lodash/find'
import { cFunctions } from '@adapter/common'

const normalizeKey = input => deburr(input.toLowerCase().trim().replace(/[/+\s.]/ig, '-').replace('€', '').replace('%', ''))
export const getControlRecord = columns => {
  const [firstColumn] = columns
  switch (firstColumn) {
    case 'category_id':
      return [
        checkRecordCategories,
        ['category_id', 'display'],// unici all'interno del file
        [
          {
            type: 'MACRO',
            params: { includeId: false },
          },
          { type: 'CATEGORY' },
        ],
      ]
    case 'product_id': {
      const extra = columns.slice(15, columns.length)
      return [
        checkRecordProducts,
        ['product_id', ['display', 'category']],// unici all'interno del file
        [
          {
            type: 'CATEGORY',
            params: { includeId: false },
          },
          { type: 'PRODUCT', params: { displayColumn: ['display', 'category'] } },
          {
            type: 'CATALOG',
            params: { columns: ['default'] },
          },
          {
            type: 'VAT_DEPARTMENT',
            params: { displayColumn: '' },// non serve il display
          },
        ],
        extra,
      ]
    }
    case 'variant_id': {
      const extra = columns.slice(9, columns.length)
      return [
        checkRecordVariants,
        ['variant_id', ['display', 'category']],// unici all'interno del file
        [
          {
            type: 'CATEGORY',
            params: { includeId: false },
          },
          { type: 'VARIANT', params: { displayColumn: ['display', 'category'] } },
          {
            type: 'CATALOG',
            params: { columns: ['default'] },
          },
        ],
        extra,
      ]
    }
    case 'customer_address_id': {
      return [
        checkRecordCustomerAddress,
        ['customer_address_id'],// unici all'interno del file
      ]
    }
    default:
      return []
  }
}

function checkDuplicate (column, value, prev, errors, line) {
  prev[value] && errors.push({
    reason: { code: 'DUPLICATE_VALUE', value },
    line,
    column,
    extra: prev[value],
  })
}

function checkIsEmpty (column, value, errors, line) {
  !value && errors.push({
    reason: { code: 'EMPTY_VALUE', value },
    line,
    column,
  })
}

function checkMissing (column, index, value, presence, errors, line) {
  !presence[index][value] && errors.push({
    reason: { code: 'MISSING_VALUE', value },
    line,
    column,
  })
}

function defaultCatalogMissing (column, errors, line) {
  errors.push({
    reason: { code: 'MISSING_DEFAULT_CATALOG' },
    line,
    column,
  })
}

function priceDefaultCatalogMissing (column, errors, line) {
  errors.push({
    reason: { code: 'MISSING_DEFAULT_CATALOG_PRICE' },
    line,
    column,
  })
}

function checkAlreadyInDatabase (column, index, value, id, presence, errors, line) {
  (presence[index][value] && presence[index][value]['_id'] !== id) && errors.push({
    reason: { code: 'PRESENT_VALUE', value },
    line,
    column,
  })
}

/* eslint-disable id-length */
function standardChanging (record) {
  const { index, short_display: shortDisplay, display } = record
  return {
    ...record,
    index: index ? parseInt(index, 10) : 1000,// se non impostato metto numero alto
    short_display: shortDisplay || display,
  }
}
const getUUID = cFunctions.getUUID()
const checkRecordCustomerAddress = (record, line, previous) => {
  const errors = []
  const { customer_address_id: customerAddressId, surname, owner } = record
  checkDuplicate('customer_address_id', customerAddressId, previous, errors, line)
  checkIsEmpty('surname', surname, errors, line)
  // eslint-disable-next-line no-unused-vars
  const { customer_address_id, ...rest } = record
  const checkedRecord = {
    ...rest,
    _candidateKey: customerAddressId || `CUSTOMER_ADDRESS_${surname.toUpperCase()}_${getUUID()}_${owner}`,
    _isEdit: Boolean(customerAddressId),
    type: 'CUSTOMER_ADDRESS',
  }
  return { checkedRecord, errors }
}
const checkRecordCategories = (record, line, previous, presence) => {
  const errors = []
  const { display, category_id: categoryId, macro, owner } = record
  checkDuplicate('display', display, previous, errors, line)
  checkDuplicate('category_id', categoryId, previous, errors, line)
  checkIsEmpty('macro', macro, errors, line)
  checkIsEmpty('display', display, errors, line)
  macro && checkMissing('macro', 0, macro, presence, errors, line)
  categoryId && checkMissing('category_id', 1, categoryId, presence, errors, line)
  display && checkAlreadyInDatabase('display', 2, display, categoryId, presence, errors, line)
  // eslint-disable-next-line no-unused-vars
  const { category_id, r, g, b, ...rest } = record
  const checkedRecord = {
    ...standardChanging(rest),
    _candidateKey: categoryId || `CATEGORY_${normalizeKey(display)}_${owner}`,
    _isEdit: Boolean(categoryId),
    rgb: [r ? parseInt(r, 10) : 214, g ? parseInt(g, 10) : 215, b ? parseInt(b, 10) : 215],
    type: 'CATEGORY',
  }
  return { checkedRecord, errors }
}
const checkRecordProducts = (record, line, previous, presence, catalogs = []) => {
  const errors = []
  const { display, product_id: productId, category, owner } = record
  checkDuplicate('display/category', `${display}_${category}`, previous, errors, line)
  checkDuplicate('product_id', productId, previous, errors, line)
  checkIsEmpty('category', category, errors, line)
  checkIsEmpty('display', display, errors, line)
  // indice alfabetico delle proprietà
  category && checkMissing('category', 0, category, presence, errors, line)
  productId && checkMissing('product_id', 1, productId, presence, errors, line)
  const prices = []
  const defaultCatalog = presence[4][true]
  if (!defaultCatalog) {
    defaultCatalogMissing('', errors, line)
  } else {
    for (let catalog of catalogs) {
      if (catalog) {checkMissing(catalog, 5, catalog, presence, errors, line)}
      const catalogId = get(presence[5], `${catalog}._id`)
      const price = parseInt(record[catalog], 10)
      if (defaultCatalog._id === catalogId) {
        isNaN(price) && priceDefaultCatalogMissing(catalog, errors, line)
      }
      if (catalogId && isNumber(price)) {
        prices.push({
          catalog: catalogId,
          price,
        })
      }
      delete record[catalog]
    }
  }
  const categoryId = `CATEGORY_${normalizeKey(category)}_${owner}`
  if (display) {checkAlreadyInDatabase('display', 2, `${display}_${categoryId}`, productId, presence, errors, line)}
  // eslint-disable-next-line no-unused-vars
  const { product_id, r, g, b, department, hidden, preferred, disabled, instock, min, ...rest } = record
  const vatKey = `VAT_DEPARTMENT_${department}_${owner}`
  checkMissing('department', 6, vatKey, presence, errors, line)
  const checkedRecord = {
    ...standardChanging(rest),
    _candidateKey: productId || `PRODUCT_${normalizeKey(display)}::${normalizeKey(category)}_${owner}`,
    _isEdit: Boolean(productId),
    category: categoryId,
    disabled: Boolean(disabled),
    hidden: Boolean(hidden),
    instock: isNaN(parseInt(instock, 10)) ? undefined : parseInt(instock, 10),
    min: isNaN(parseInt(min, 10)) ? undefined : parseInt(min, 10),
    preferred: Boolean(preferred),
    prices,
    rgb: [r ? parseInt(r, 10) : 255, g ? parseInt(g, 10) : 255, b ? parseInt(b, 10) : 255],
    type: 'PRODUCT',
    vat_department_id: vatKey,
  }
  return { checkedRecord, errors }
}
const checkRecordVariants = (record, line, previous, presence, catalogs = []) => {
  const errors = []
  const { display, variant_id: variantId, category, owner } = record
  checkDuplicate('display/category', `${display}_${category}`, previous, errors, line)
  checkDuplicate('variant_id', variantId, previous, errors, line)
  checkIsEmpty('category', category, errors, line)
  checkIsEmpty('display', display, errors, line)
  // indice alfabetico delle proprietà
  category && checkMissing('category', 0, category, presence, errors, line)
  variantId && checkMissing('variant_id', 1, variantId, presence, errors, line)
  const prices = []
  const defaultCatalog = presence[4][true]
  if (!defaultCatalog) {
    defaultCatalogMissing('', errors, line)
  } else {
    for (let catalog of catalogs) {
      const cleanCatalog = catalog.replace('_WITHOUT', '').replace('_WITH', '')
      if (cleanCatalog) {checkMissing(catalog, 5, cleanCatalog, presence, errors, line)}
      const catalogId = get(presence[5], `${cleanCatalog}._id`)
      const price = parseInt(record[catalog], 10)
      if (defaultCatalog._id === catalogId) {
        isNaN(price) && priceDefaultCatalogMissing(catalog, errors, line)
      }
      if (catalogId && isNumber(price)) {
        const isWith = catalog.endsWith('WITH')
        const found = find(prices, { catalog: catalogId })
        if (found) {
          if (isWith) {found.price_with = price} else {found.price_without = price}
        } else {
          if (isWith) {
            prices.push({ catalog: catalogId, price_with: price })
          } else {
            prices.push({
              catalog: catalogId,
              price_without: price,
            })
          }
        }
      }
      delete record[catalog]
    }
  }
  const categoryId = `CATEGORY_${normalizeKey(category)}_${owner}`
  if (display) {checkAlreadyInDatabase('display', 2, `${display}_${categoryId}`, variantId, presence, errors, line)}
  // eslint-disable-next-line no-unused-vars
  const { variant_id, r, g, b, option, ...rest } = record
  const checkedRecord = {
    ...standardChanging(rest),
    _candidateKey: variantId || `VARIANT_${normalizeKey(display)}::${normalizeKey(category)}_${owner}`,
    _isEdit: Boolean(variantId),
    category: categoryId,
    option: isNaN(parseInt(option, 10)) ? 3 : parseInt(option, 10),
    prices,
    rgb: [r ? parseInt(r, 10) : 255, g ? parseInt(g, 10) : 255, b ? parseInt(b, 10) : 255],
    type: 'VARIANT',
  }
  return { checkedRecord, errors }
}
/* eslint-enable id-length */
