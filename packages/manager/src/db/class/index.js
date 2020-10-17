import get from 'lodash/get'
import config from 'config'

const { connections } = config.get('couchbase')
const { server: HOST_DEFAULT, backend: BACKEND_HOST_DEFAULT, _bucket: AST_DEFAULT, _archivio: ARC_DEFAULT } = connections['astenposServer']

export default class Couchbase {
  constructor (astenpos, archive, backendHost = BACKEND_HOST_DEFAULT) {
    this._astenpos = astenpos
    this._archive = archive
    this._backendHost = backendHost || ''
  }
  
  connHost () {
    const base = get(this._astenpos, '_cluster._connStr', HOST_DEFAULT) //suppose the same form archive
    return base.replace('couchbase://', '')
  }
  
  astenposBucketName () {
    return this._astenpos.name
  }
  
  archiveBucketName () {
    return this._archive.name
  }
  
  astenposBucketPassword () {
    const base = get(this._astenpos, '_cluster._auth')
    return base.password
  }
  
  archiveBucketPassword () {
    const base = get(this._archive, '_cluster._auth')
    return base.password
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
      HOST: this.host,
      BUCKET_NAME: this.astenposBucketName() || AST_DEFAULT,
      COLLECTION: this.astenposBucketCollection,
      PASSWORD: this.astenposBucketPassword(),
    }
  }
  
  get arcConnection () {
    return {
      HOST: this.host,
      BUCKET_NAME: this.archiveBucketName() || ARC_DEFAULT,
      COLLECTION: this.archiveBucketCollection,
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
      server: this.host,
    }
  }
  
  toString () {
    return '[@ASTENPOS_CONNECTION_OBJECT]'
  }
}

