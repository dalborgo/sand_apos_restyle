import create from 'zustand'
import immerMiddleware from './immerMiddleware'

const initialState = {
  openFilter: false,
  runningRows: [],
}

const useRunningTablesStore = create(immerMiddleware(set => ({
  ...initialState,
  reset: () => set(() => initialState),
  switchOpenFilter: () => set(state => !state.openFilter),
  setRunningRows: rows => set(state => {
    state.runningRows = rows
  }),
})))

export default useRunningTablesStore
