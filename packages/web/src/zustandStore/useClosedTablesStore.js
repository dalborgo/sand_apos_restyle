import create from 'zustand'
import immerMiddleware from './immerMiddleware'
import moment from 'moment'
// usa il format che non mette le cifre meno significative e permette di usare la cache
const initialState = {
  closedRows: [],
  endDate: moment().format('YYYY-MM-DD'),
  filter: {
    table: '',
    room: '',
  },
  openFilter: false,
  startDate: moment().format('YYYY-MM-DD'),
}

const useClosedTablesStore = create(immerMiddleware(set => ({
  ...initialState,
  reset: () => set(() => initialState),
  switchOpenFilter: () => set(state => {
    state.openFilter = !state.openFilter
  }),
  setClosedRows: rows => set(state => {
    state.closedRows = rows
  }),
  setDateRange: input => set(state => {
    const [startDate, endDate] = input
    if (startDate && endDate) {
      state.startDate = startDate
      state.endDate = endDate
    }
  }),
  submitFilter: ({ room, table }) => set(state => {
    state.filter.room = room
    state.filter.table = table
    state.openFilter = !state.openFilter
  }),
})))

export default useClosedTablesStore
