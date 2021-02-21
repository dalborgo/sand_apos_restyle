import create from 'zustand'
import immerMiddleware from './immerMiddleware'
import moment from 'moment'

const initialState = {
  startDate: null,
  endDate: null,
  startDateInMillis: null,
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
      state.startDateInMillis = startDate ? moment(startDate).format('YYYYMMDDHHmmssSSS') : undefined
      state.endDateInMillis = endDate ? moment(endDate).format('YYYYMMDDHHmmssSSS') : undefined
    }
  }),
})))

export default useClosingDayStore
