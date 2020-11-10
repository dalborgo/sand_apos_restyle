import get from 'lodash/get'
import config from 'config'

const { connections } = config.get('couchbase')
const {
  _archivio: ARC_DEFAULT,
  _bucket: AST_DEFAULT,
  _manager: MAN_DEFAULT,
  backend: BACKEND_HOST_DEFAULT,
  server: HOST_DEFAULT,
} = connections['astenposServer']

export default class Couchbase {
  constructor (cluster, astenpos, archive, manager, backendHost = BACKEND_HOST_DEFAULT) {
    this._cluster = cluster
    this._astenpos = astenpos
    this._archive = archive
    this._manager = manager
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
  
  get archiveBucketName () {
    return this._archive.name || ARC_DEFAULT
  }
  
  get managerBucketName () {
    return this._manager.name || MAN_DEFAULT
  }
  
  get astenposBucketCollection () {
    return this._astenpos.defaultCollection()
  }
  
  get archiveBucketCollection () {
    return this._archive.defaultCollection()
  }
  
  get managerBucketCollection () {
    return this._manager.defaultCollection()
  }
  
  get astenposBucket () {
    return this._astenpos
  }
  
  get archiveBucket () {
    return this._archive
  }
  
  get managerBucket () {
    return this._manager
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
  
  get arcConnection () {
    return {
      BUCKET: this.archiveBucket,
      BUCKET_NAME: this.archiveBucketName,
      CLUSTER: this.cluster,
      COLLECTION: this.archiveBucketCollection,
      HOST: this.host,
      PASSWORD: this.archiveBucketPassword(),
    }
  }
  
  get manConnection () {
    return {
      BUCKET: this.managerBucket,
      BUCKET_NAME: this.managerBucketName,
      CLUSTER: this.cluster,
      COLLECTION: this.managerBucketCollection,
      HOST: this.host,
      PASSWORD: this.managerBucketPassword(),
    }
  }
  
  get oldConnection () {
    return {
      _archivio: this.archiveBucketName,
      _bucket: this.astenposBucketName,
      _password_archivio: this.archiveBucketPassword(),
      _password_bucket: this.astenposBucketPassword(),
      archivio: this.astenposBucketCollection,
      backend: this.backendHost,
      bucket: this.astenposBucketCollection,
      cluster: this.cluster,
      server: this.host,
    }
  }
  
  connHost () {
    const base = get(this._astenpos, '_cluster._connStr', HOST_DEFAULT) //suppose the same form archive
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
  
  archiveBucketPassword () {
    const base = get(this._archive, '_cluster._auth')
    return base.password
  }
  
  managerBucketPassword () {
    const base = get(this._manager, '_cluster._auth')
    return base.password
  }
  
  toString () {
    return '[@ASTENPOS_CONNECTION_OBJECT]'
  }
  
}

