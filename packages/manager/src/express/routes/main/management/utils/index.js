export const getControlRecord = columns => {
  const [firstColumn] = columns
  switch (firstColumn) {
    case 'category_id':
      return [
        checkRecordCategories, ['category_id', 'display'],
        [
          {
            type: 'MACRO',
            params: { includeId: false },
          },
          { type: 'CATEGORY' },
        ],
      ]
    default:
      return checkRecordCategories
  }
}

function checkDuplicate (column, value, prev, errors, line) {
  prev[value] && errors.push({
    reason: { code: 'DUPLICATE_VALUE', value },
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

function checkPresence (column, index, value, id, presence, errors, line) {
  (presence[index][value] && presence[index][value]['_id'] !== id) && errors.push({
    reason: { code: 'PRESENT_VALUE', value },
    line,
    column,
  })
}

/* eslint-disable id-length */
function standardChanging (record) {
  const { index, r, g, b, short_display: shortDisplay, display } = record
  return {
    ...record,
    rgb: [r ? parseInt(r, 10) : 255, g ? parseInt(g, 10) : 255, b ? parseInt(b, 10) : 255],
    index: index ? parseInt(index, 10) : 1000,// se non impostato metto numero alto
    short_display: shortDisplay || display,
  }
}

const checkRecordCategories = (record, line, previous, presence) => {
  const errors = []
  const { display, category_id: categoryId, macro, r, g, b } = record
  checkDuplicate('display', display, previous, errors, line)
  checkDuplicate('categoryId', categoryId, previous, errors, line)
  checkMissing('macro', 0, macro, presence, errors, line)
  checkPresence('display', 1, display, categoryId, presence, errors, line)
  const checkedRecord = {
    ...standardChanging(record),
    rgb: [r ? parseInt(r, 10) : 214, g ? parseInt(g, 10) : 215, b ? parseInt(b, 10) : 215],
  }
  return { checkedRecord, errors }
}
/* eslint-enable id-length */
