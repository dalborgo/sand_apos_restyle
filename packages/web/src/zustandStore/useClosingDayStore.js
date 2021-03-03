import create from 'zustand'
import immerMiddleware from './immerMiddleware'
import moment from 'moment'
const initialState = {
  closingRows: [],
  endDate: moment().format('YYYY-MM-DD'),
  startDate: moment().format('YYYY-MM-01'),
}

const useClosingDayStore = create(immerMiddleware(set => ({
  ...initialState,
  reset: () => set(() => initialState),
  setDateRange: input => set(state => {
    const [startDate, endDate] = input
    if (startDate && endDate) {
      state.startDate = startDate
      state.endDate = endDate
    }
  }),
  setClosingRows: rows => set(state => {
    state.closingRows = rows
  }),
})))

export default useClosingDayStore
