import create from 'zustand'
import immerMiddleware from './immerMiddleware'

const initialState = {
  openFilter: false,
  closingRows: [],
  filter: {
    table: '',
    room: '',
  },
}

const useClosedTablesStore = create(immerMiddleware(set => ({
  ...initialState,
  reset: () => set(() => initialState),
  switchOpenFilter: () => set(state => {
    state.openFilter = !state.openFilter
  }),
  setClosingRows: rows => set(state => {
    state.runningRows = rows
  }),
  submitFilter: ({ room, table }) => set(state => {
    state.filter.room = room
    state.filter.table = table
    state.openFilter = !state.openFilter
  }),
})))

export default useClosedTablesStore
