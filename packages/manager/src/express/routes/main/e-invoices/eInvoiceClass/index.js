import get from 'lodash/get'
import config from 'config'
import moment from 'moment'
import log from '@adapter/common/src/winston'
const qs = require('qs')

const { axios } = require(__helpers)
const { authenticationBaseUrl, username, password } = config.get('e_invoice')

export const authStates = {
  EXPIRED: 'EXPIRED',
  NO_AUTH: 'NO_AUTH',
  REFRESHABLE: 'REFRESHABLE',
  VALID: 'VALID',
}

const authHeaders = { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }

class EInvoice {
  constructor (auth) {
    this._auth = auth
  }
  
  get authData () {
    return this._auth
  }
  
  get accessToken () {
    return get(this._auth, 'access_token')
  }
  
  get refreshToken () {
    return get(this._auth, 'refresh_token')
  }
  
  get state () {
    if (!this._auth) {
      return authStates.NO_AUTH
    }
    const duration = this.restInSeconds
    if(duration > 0){
      return authStates.VALID
    }
    if(duration > -1800){
      return authStates.REFRESHABLE
    }
    return authStates.EXPIRED
  }
  
  get restInSeconds () {
    const expires = moment(this._auth['.expires'])
    const duration = moment.duration(expires.diff(moment()))
    const inSeconds = duration.asSeconds()
    log.debug('eInvoice duration in seconds', inSeconds)
    return inSeconds
  }
  
  async setAuth () {
    const { data } = await axios.eInvoiceInstance(authenticationBaseUrl, null, authHeaders).post('/auth/signin', qs.stringify({
      grant_type: 'password',
      username,
      password,
    }))
    log.debug('eInvoice setAuth')
    this._auth = get(data, 'results')
  }
  
  async refresh () {
    const { data } = await axios.eInvoiceInstance(authenticationBaseUrl, null, authHeaders).post('/auth/signin', qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
    }))
    log.debug('eInvoice refresh')
    this._auth = get(data, 'results')
  }
  
  toString () {
    return '[@E_INVOICE_CONNECTION_OBJECT]'
  }
  
}

const eInvoiceAuth = new EInvoice()

export default eInvoiceAuth
