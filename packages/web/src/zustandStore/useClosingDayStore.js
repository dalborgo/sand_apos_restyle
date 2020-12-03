import create from 'zustand'
import immerMiddleware from './immerMiddleware'

const initialState = {
  startDate: null,
  startDateInMillis: null,
  endDate: null,
  endDateInMillis: null,
}

const useClosingDayStore = create(immerMiddleware(set => ({
  ...initialState,
  reset: () => set(() => initialState),
  setDateRange: input => set(state => {
    const [startDate, endDate] = input
    if (startDate && endDate) {
      state.startDate = startDate
      state.endDate = endDate
      state.startDateInMillis = startDate.format('YYYYMMDDHHmmssSSS')
      state.endDateInMillis = endDate.endOf('day').format('YYYYMMDDHHmmssSSS')
    }
  }),
})))

export default useClosingDayStore
