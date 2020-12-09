import create from 'zustand'
import immerMiddleware from './immerMiddleware'

const initialState = {
  openFilter: false,
  runningRows: [],
  filter: {
    table: '',
    room: '',
  },
}

const useRunningTablesStore = create(immerMiddleware(set => ({
  ...initialState,
  reset: () => set(() => initialState),
  switchOpenFilter: () => set(state => {
    state.openFilter = !state.openFilter
  }),
  setRunningRows: rows => set(state => {
    state.runningRows = rows
  }),
  setFilter: ({ room, table }) => set(state => {
    state.filter.room = room
    state.filter.table = table
  }),
})))

export default useRunningTablesStore
