import produce from 'immer'

export const immerMiddleware = config => (set, get) => config(fn => set(produce(fn)), get)
