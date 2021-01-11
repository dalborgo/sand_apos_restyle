import get from 'lodash/get'
import config from 'config'

const { connections } = config.get('couchbase')
const {
  _bucket: AST_DEFAULT,
  backend: BACKEND_HOST_DEFAULT,
  server: HOST_DEFAULT,
} = connections['astenposServer']

export default class Couchbase {
  constructor (cluster, astenpos, backendHost = BACKEND_HOST_DEFAULT) {
    this._cluster = cluster
    this._astenpos = astenpos
    this._backendHost = backendHost || ''
  }
  
  get cluster () {
    return this._cluster
  }
  
  get host () {
    return this.connHost()
  }
  
  get backendHost () {
    return this._backendHost
  }
  
  get connJSON () {
    return {
      HOST: this.host,
      BACKEND_HOST: this.backendHost,
    }
  }
  
  get astenposBucketName () {
    return this._astenpos.name || AST_DEFAULT
  }
  
  get astenposBucketCollection () {
    return this._astenpos.defaultCollection()
  }

  get astenposBucket () {
    return this._astenpos
  }
  
  get astConnection () {
    return {
      BUCKET: this.astenposBucket,
      BUCKET_NAME: this.astenposBucketName,
      CLUSTER: this.cluster,
      COLLECTION: this.astenposBucketCollection,
      HOST: this.host,
      PASSWORD: this.astenposBucketPassword(),
    }
  }

  connHost () {
    const base = get(this._astenpos, '_cluster._connStr', HOST_DEFAULT)
    const regex = /couchbase:\/\/([a-z\d.]+)\??/
    const match = regex.exec(base)
    if (match) {
      const [_, group] = match
      return group
    } else {
      return HOST_DEFAULT
    }
  }
  
  astenposBucketPassword () {
    const base = get(this._astenpos, '_cluster._auth')
    return base.password
  }
  
  toString () {
    return '[@ASTENPOS_CONNECTION_OBJECT]'
  }
  
}

