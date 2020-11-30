import create from 'zustand'
import immerMiddleware from './immerMiddleware'

const initialState = {
  allIn: false,
  priority: 0,
}

const useGeneralStore = create(immerMiddleware(set => ({
  ...initialState,
  switchAllIn: () => set(state => {
    state.allIn = !state.allIn
  }),
  reset: () => set(() => initialState),
})))

export default useGeneralStore
