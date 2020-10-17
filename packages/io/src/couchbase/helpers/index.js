import config from 'config'

const { connections } = config.get('couchbase')
const { server: HOST_DEFAULT, backend: BACKEND_HOST_DEFAULT } = connections['astenposServer']

export function normConnection (connection) {
  return {
    HOST: connection.HOST || HOST_DEFAULT,
    BACKEND_HOST: connection.BACKEND_HOST || BACKEND_HOST_DEFAULT,
  }
}
