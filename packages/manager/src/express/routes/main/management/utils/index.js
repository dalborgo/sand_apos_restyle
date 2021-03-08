import deburr from 'lodash/deburr'
import get from 'lodash/get'
import isNaN from 'lodash/isNaN'
import find from 'lodash/find'
import { cFunctions } from '@adapter/common'

const normalizeKey = input => deburr(input.toLowerCase().trim().replace(/[/+\s.]/ig, '-').replace('€', '').replace('%', ''))
const manageNumber = (instock, default_) => isNaN(parseInt(instock, 10)) ? default_ : parseInt(instock, 10)
// eslint-disable-next-line id-length
const getRgb = (r, g, b, default_ = [255, 255, 255]) => [r ? parseInt(r, 10) : default_[0], g ? parseInt(g, 10) : default_[1], b ? parseInt(b, 10) : default_[2]]

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
            type: 'CATEGORY',// [0]_id, [1]display
          },
          { type: 'PRODUCT', params: { columns: ['category'] }, skip: ['category'] },// [2]_id, [3]display
          {
            type: 'CATALOG',
            params: { columns: ['default'] }, skip: ['_id'],// [4]default, [5]display
          },
          {
            type: 'VAT_DEPARTMENT',
            params: { displayColumn: '' },// non serve il display [6]_id
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
          },
          { type: 'VARIANT', params: { columns: ['category'] }, skip: ['category'] },
          {
            type: 'CATALOG',
            params: { columns: ['default'] }, skip: ['_id'],
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

function checkAlreadyInDatabase (column, index, value, id, presence, errors, line) {
  (presence[index][value] && presence[index][value][0]['_id'] !== id) && errors.push({
    reason: { code: 'PRESENT_VALUE', value },
    line,
    column,
  })
}

export function generalError (column, errors, line, code, value) {
  errors.push({
    reason: { code, value },
    line,
    column,
  })
}

/* eslint-disable id-length */
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
  const { category_id, r, g, b, index, short_display: shortDisplay, ...rest } = record
  const checkedRecord = {
    ...rest,
    _candidateKey: categoryId || `CATEGORY_${normalizeKey(display)}_${owner}`,
    _isEdit: Boolean(categoryId),
    index: index ? parseInt(index, 10) : 1000,// se non impostato metto numero alto
    rgb: getRgb(r, g, b, [214, 215, 215]),
    short_display: shortDisplay || display,
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
  category && checkMissing('category', 1, category, presence, errors, line)
  productId && checkMissing('product_id', 2, productId, presence, errors, line)
  
  const prices = []
  
  const defaultCatalog = presence[4][true]// array
  if (defaultCatalog) {
    const defaultCatalogCount = defaultCatalog.length
    if (defaultCatalogCount === 1) {
      for (let catalog of catalogs) {
        if (catalog) {checkMissing(catalog, 5, catalog, presence, errors, line)}
        const catalogId = get(presence[5], `[${catalog}][0][_id]`)
        const price = parseInt(record[catalog], 10)
        if (defaultCatalog[0]._id === catalogId) {
          isNaN(price) && generalError(catalog, errors, line, 'MISSING_DEFAULT_CATALOG_PRICE')
        }
        if (catalogId && !isNaN(price)) {
          prices.push({
            catalog: catalogId,
            price,
          })
        }
        delete record[catalog]
      }
    }
  }
  const categoryId = get(presence[1], `[${category}][0][_id]`)
  const productCategoryId = `PRODUCT_${normalizeKey(display)}::${normalizeKey(category)}_${owner}`
  
  const displayExistArray = get(presence[3], `[${display}]`, [])
  let foundProduct = false
  if (displayExistArray.length) {
    for (let displayExist of displayExistArray) {
      const categoryDisplayExist = get(presence[0], `[${displayExist.category}][0][display]`)
      if (categoryDisplayExist === category && displayExist._id !== productId) {
        generalError('display/category', errors, line, 'PRESENT_VALUE', `${display}/${category}`)
        foundProduct = true
        break
      }
    }
  }
  
  !foundProduct && checkAlreadyInDatabase('display/category', 2, productCategoryId, productId, presence, errors, line)
  /* eslint-disable no-unused-vars */
  const {
    product_id,
    r,
    g,
    b,
    department,
    hidden,
    preferred,
    disabled,
    instock,
    min,
    index,
    short_display: shortDisplay,
    ...rest
  } = record
  /* eslint-enable no-unused-vars */
  const vatKey = `VAT_DEPARTMENT_${department}_${owner}`
  checkMissing('department', 6, vatKey, presence, errors, line)
  const checkedRecord = {
    ...rest,
    _candidateKey: productId || productCategoryId,
    _isEdit: Boolean(productId),
    category: categoryId,
    disabled: Boolean(disabled),
    hidden: Boolean(hidden),
    index: index ? parseInt(index, 10) : 1000,// se non impostato metto numero alto
    instock: manageNumber(instock),
    min: manageNumber(min),
    preferred: Boolean(preferred),
    prices,
    rgb: getRgb(r, g, b),
    short_display: shortDisplay || display,
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
  category && checkMissing('category', 1, category, presence, errors, line)
  variantId && checkMissing('variant_id', 2, variantId, presence, errors, line)
  const prices = []
  const defaultCatalog = presence[4][true]
  if (defaultCatalog) {
    const defaultCatalogCount = defaultCatalog.length
    if (defaultCatalogCount === 1) {
      for (let catalog of catalogs) {
        const cleanCatalog = catalog.replace('_WITHOUT', '').replace('_WITH', '')
        if (cleanCatalog) {checkMissing(catalog, 5, cleanCatalog, presence, errors, line)}
        const catalogId = get(presence[5], `[${cleanCatalog}][0][_id]`)
        const price = parseInt(record[catalog], 10)
        if (defaultCatalog[0]._id === catalogId) {
          isNaN(price) && generalError(catalog, errors, line, 'MISSING_DEFAULT_CATALOG_PRICE')
        }
        if (catalogId && !isNaN(price)) {
          const isWith = catalog.endsWith('WITH')
          const found = find(prices, { catalog: catalogId })
          if (found) {
            if (isWith) {found.price_with = price} else {found.price_without = price}
          } else {
            if (isWith) {
              prices.push({ catalog: catalogId, price_with: price, price_without: 0 })// di default a zero
            } else {
              prices.push({ catalog: catalogId, price_without: price, price_with: 0 })
            }
          }
        }
        delete record[catalog]
      }
    }
  }
  const categoryId = get(presence[1], `[${category}][0][_id]`)
  const variantCategoryId = `VARIANT_${normalizeKey(display)}::${normalizeKey(category)}_${owner}`
  
  const displayExistArray = get(presence[3], `[${display}]`, [])
  let foundVariant = false
  if (displayExistArray.length) {
    for (let displayExist of displayExistArray) {
      const categoryDisplayExist = get(presence[0], `[${displayExist.category}][0][display]`)
      if (categoryDisplayExist === category && displayExist._id !== variantId) {
        generalError('display/category', errors, line, 'PRESENT_VALUE', `${display}/${category}`)
        foundVariant = true
        break
      }
    }
  }
  
  !foundVariant && checkAlreadyInDatabase('display/category', 2, variantCategoryId, variantId, presence, errors, line)
  
  // eslint-disable-next-line no-unused-vars
  const { variant_id, r, g, b, option, index, short_display: shortDisplay, ...rest } = record
  const checkedRecord = {
    ...rest,
    _candidateKey: variantId || variantCategoryId,
    _isEdit: Boolean(variantId),
    category: categoryId,
    index: index ? parseInt(index, 10) : 1000,// se non impostato metto numero alto
    option: manageNumber(option, 3),
    prices,
    rgb: getRgb(r, g, b),
    short_display: shortDisplay || display,
    type: 'VARIANT',
  }
  return { checkedRecord, errors }
}
/* eslint-enable id-length */
