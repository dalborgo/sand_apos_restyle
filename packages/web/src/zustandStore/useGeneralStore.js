import create from 'zustand'
import immerMiddleware from './immerMiddleware'

const initialState = {
  allIn: false,
  companyData: {},
  gcData: {},
  loading: false,
  locales: [],
  priority: 0,
}

const useGeneralStore = create(immerMiddleware((set, get) => ({
  ...initialState,
  hasSingleCompany: () => Object.keys(get().companyData).length < 2,
  companySelect: owner => get().companyData ? get().companyData?.[owner]?.name : owner,
  gcSelect: owner => get().gcData ? get().gcData?.[owner] : owner,
  switchAllIn: () => set(state => {
    state.allIn = !state.allIn
  }),
  setLoading: val => set(state => {
    state.loading = val
  }),
  reset: () => set(() => initialState),
})))

export default useGeneralStore
