import create from 'zustand'
import immerMiddleware from './immerMiddleware'

const initialState = {
  closedRows: [],
  endDate: null,
  filter: {
    table: '',
    room: '',
  },
  openFilter: false,
  startDate: null,
}

const useClosedTablesStore = create(immerMiddleware(set => ({
  ...initialState,
  reset: () => set(() => initialState),
  switchOpenFilter: () => set(state => {
    state.openFilter = !state.openFilter
  }),
  setClosedRows: rows => set(state => {
    state.runningRows = rows
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
