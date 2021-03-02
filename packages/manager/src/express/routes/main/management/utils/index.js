function checkDuplicate (column, value, prev, errors, line) {
  prev[value] && errors.push({
    reason: { code: 'DUPLICATE_VALUE', value },
    line,
    column,
  })
}

const checkRecordCategories = (record, line, prev) => {
  const errors = []
  const { index, display, category_id: categoryId } = record
  checkDuplicate('display', display, prev, errors, line)
  checkDuplicate('categoryId', categoryId, prev, errors, line)
  const checkedRecord = {
    ...record,
    index: index ? parseInt(index, 10) : 1000,// se non impostato metto numero alto
  }
  return { checkedRecord, errors }
}

export const getControlRecord = columns => {
  const [firstColumn] = columns
  switch (firstColumn) {
    case 'category_id':
      return [checkRecordCategories, ['category_id', 'display']]
    default:
      return checkRecordCategories
  }
}
