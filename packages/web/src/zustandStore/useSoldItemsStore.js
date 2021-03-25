import create from 'zustand'
import immerMiddleware from './immerMiddleware'
import moment from 'moment'

const initialState = {
  endDate: moment().format('YYYY-MM-DD'),
  endDateInMillis: moment().format('YYYYMMDDHHmmssSSS'),
  startDate: moment().format('YYYY-MM-01'),
  startDateInMillis: moment().format('YYYYMM01HHmmssSSS'),
  filter: {
    room: '',
    startTime: null,
  },
  openFilter: false,
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
  submitFilter: ({ room, startTime }) => set(state => {
    state.filter.room = room
    state.filter.startTime = startTime
    state.openFilter = !state.openFilter
  }),
  switchOpenFilter: () => set(state => {
    state.openFilter = !state.openFilter
  }),
})))

export default useClosingDayStore
