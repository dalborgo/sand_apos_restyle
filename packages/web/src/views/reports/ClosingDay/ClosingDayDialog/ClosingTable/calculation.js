export const calculateClosingTable = closing => {
  const { modes, payment_incomes: paymentIncomes, operators } = closing
  let daily = {}
  
  function getVal (key, label, user) {
    return modes.reduce((prev, curr) => {
      prev += closing[`pu_${user}_${curr.value}_${key}_${label}`] || 0
      return prev
    }, 0)
  }
  
  for (let operator of operators) {
    const { user } = operator
    for (let mode of modes) {
      const { value, name } = mode
      daily = {
        ...daily,
        [`${user}_${value}`]: {
          name,
          val: closing[`pu_${user}_${value}_totale`],
          num: closing[`pu_${user}_${value}_nd`],
        },
        [`${user}_${value}_sc`]: {
          name,
          val: closing[`pu_${user}_${value}_sc`],
          num: closing[`pu_${user}_${value}_ns`],
        },
        [`${user}_st`]: { val: closing[`pu_${user}_st`], num: closing[`pu_${user}_nst`] },
        [`${user}_sc`]: { val: closing[`pu_${user}_sc`], num: closing[`pu_${user}_ns`] },
        [user]: { val: closing[`pu_${user}_totale`], num: closing[`pu_${user}_nd`] },
      }
      for (let income of paymentIncomes) {
        const { display, key } = income
        daily = {
          ...daily,
          [`${user}_${key}`]: {
            display,
            val: getVal(key, 'totale', user),
            num: getVal(key, 'nd', user),
          },
        }
      }
    }
  }
  return daily
}

