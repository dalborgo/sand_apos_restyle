export const calculateClosingTable = closing => {
  const { modes, payment_incomes: paymentIncomes } = closing
  let daily = {}
  
  function getVal (key, label) {
    return modes.reduce((prev, curr) => {
      prev += closing[`pu_totale_${curr.value}_${key}_${label}`] || 0
      return prev
    }, 0)
  }
  
  for (let mode of modes) {
    const { value, name } = mode
    daily = {
      ...daily,
      [`tot_${value}`]: { name, val: closing[`pu_totale_${value}_totale`], num: closing[`pu_totale_${value}_nd`] },
      [`tot_${value}_sc`]: { name, val: closing[`pu_totale_${value}_sc`], num: closing[`pu_totale_${value}_ns`] },
      tot_st: { val: closing['pu_totale_st'], num: closing['pu_totale_nst'] },
      tot_sc: { val: closing['pu_totale_sc'], num: closing['pu_totale_ns'] },
      tot: { val: closing['pu_totale_totale'], num: closing['pu_totale_nd'] },
    }
    for (let income of paymentIncomes) {
      const { display, key } = income
      daily = {
        ...daily,
        [`tot_${key}`]: {
          display,
          val: getVal(key, 'totale'),
          num: getVal(key, 'nd'),
        },
      }
    }
  }
  return daily
}

