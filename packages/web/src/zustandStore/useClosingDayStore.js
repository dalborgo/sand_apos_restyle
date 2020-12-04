import create from 'zustand'
import immerMiddleware from './immerMiddleware'

const initialState = {
  startDate: null,
  endDate: null,
  closingRows: [],
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
