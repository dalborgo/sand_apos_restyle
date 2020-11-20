import create from 'zustand'

const useGeneralStore = create(set => ({
  allIn: false,
  switchAllIn: () => set(state => ({ allIn: !state.allIn })),
  resetAllIn: () => set({ allIn: false }),
}))

export default useGeneralStore
