import produce from 'immer'

const immerMiddleware = config => (set, get) => config(fn => set(produce(fn)), get)

export default immerMiddleware
