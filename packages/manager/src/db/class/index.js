import get from 'lodash/get'
import config from 'config'

const { connections } = config.get('couchbase')
const { server: HOST_DEFAULT, backend: BACKEND_HOST_DEFAULT, _bucket: AST_DEFAULT, _archivio: ARC_DEFAULT } = connections['astenposServer']

export default class Couchbase {
  constructor (cluster, astenpos, archive, backendHost = BACKEND_HOST_DEFAULT) {
    this._cluster = cluster
    this._astenpos = astenpos
    this._archive = archive
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
  
  get astenposBucketCollection () {
    return this._astenpos.defaultCollection()
  }
  
  get archiveBucketCollection () {
    return this._archive.defaultCollection()
  }
  
  get astConnection () {
    return {
      BUCKET_NAME: this.astenposBucketName || AST_DEFAULT,
      CLUSTER: this.cluster,
      COLLECTION: this.astenposBucketCollection,
      HOST: this.host,
      PASSWORD: this.astenposBucketPassword(),
    }
  }
  
  get arcConnection () {
    return {
      BUCKET_NAME: this.archiveBucketName || ARC_DEFAULT,
      CLUSTER: this.cluster,
      COLLECTION: this.archiveBucketCollection,
      HOST: this.host,
      PASSWORD: this.archiveBucketPassword(),
    }
  }
  
  get oldConnection () {
    return {
      _archivio: this.archiveBucketName(),
      _bucket: this.astenposBucketName(),
      _password_archivio: this.archiveBucketPassword(),
      _password_bucket: this.astenposBucketPassword(),
      archivio: this.astenposBucketCollection,
      backend: this.backendHost,
      bucket: this.astenposBucketCollection,
      cluster: this.cluster,
      server: this.host,
    }
  }
  
  get astenposBucketName () {
    return this._astenpos.name
  }
  
  get archiveBucketName () {
    return this._archive.name
  }
  
  connHost () {
    const base = get(this._astenpos, '_cluster._connStr', HOST_DEFAULT) //suppose the same form archive
    const regex = /couchbase:\/\/(.*)\?/
    const match = regex.exec(base)
    const [_, group] = match
    return group
  }
  
  astenposBucketPassword () {
    const base = get(this._astenpos, '_cluster._auth')
    return base.password
  }
  
  archiveBucketPassword () {
    const base = get(this._archive, '_cluster._auth')
    return base.password
  }
  
  toString () {
    return '[@ASTENPOS_CONNECTION_OBJECT]'
  }
  
}

