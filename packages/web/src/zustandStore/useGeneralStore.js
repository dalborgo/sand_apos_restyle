import create from 'zustand'
import immerMiddleware from './immerMiddleware'

const initialState = {
  allIn: false,
  companyData: {},
  loading: false,
  priority: 0,
}

const useGeneralStore = create(immerMiddleware(set => ({
  ...initialState,
  switchAllIn: () => set(state => {
    state.allIn = !state.allIn
  }),
  setLoading: val => set(state => {
    state.loading = val
  }),
  reset: () => set(() => initialState),
})))

export default useGeneralStore
