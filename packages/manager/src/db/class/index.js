import get from 'lodash/get'
import config from 'config'

const { connections } = config.get('couchbase')
const {
  _bucket: AST_DEFAULT,
  backend: BACKEND_HOST_DEFAULT,
  server: HOST_DEFAULT,
} = connections['astenposServer']

export default class Couchbase {
  constructor (cluster, astenpos, options, backendHost = BACKEND_HOST_DEFAULT) {
    this._cluster = cluster
    this._astenpos = astenpos
    this._backendHost = backendHost || ''
    this._op = options || {}
  }
  
  get cluster () {
    return this._cluster
  }
  
  get host () {
    return this.connHost()
  }
  
  get sgAdmin () {
    return this._op['sgAdmin'] || `http://${HOST_DEFAULT}:4985` //ok with port
  }
  
  get sgAdminToken () {
    return this._op['sgAdminToken'] || ''
  }
  
  get sgPublic () {
    return this._op['sgPublic'] || `http://${HOST_DEFAULT}:4984` //ok with port
  }
  
  get sgPublicToken () {
    return this._op['sgPublicToken'] || ''
  }
  
  get serviceRestProtocol () {
    return this._op['serviceRestProtocol']
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
      SERVICE_REST_PROTOCOL: this.serviceRestProtocol,
      SG_ADMIN: this.sgAdmin,
      SG_ADMIN_TOKEN: this.sgAdminToken,
      SG_PUBLIC: this.sgPublic,
      SG_PUBLIC_TOKEN: this.sgPublicToken,
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

