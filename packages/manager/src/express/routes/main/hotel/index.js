import { queryById } from '../queries'
import axios from 'axios'
import get from 'lodash/get'
import log from '@adapter/common/src/winston'
import findIndex from 'lodash/findIndex'
import { reqAuthGet } from '../../basicAuth'

const { utils } = require(__helpers)

function addRouters (router) {
  router.get('/hotel/movements', reqAuthGet, async function (req, res) {
    const { connClass, query } = req
    utils.controlParameters(query, ['date_from', 'date_to', 'owner'])
    const { date_from: dateFrom, date_to: dateTo, active_checkins_only: activeOnly_, owner } = query
    const activeOnly = activeOnly_ && activeOnly_ !== 'false'
    const { ok, message, results: gc, ...extra } = await queryById({
      connClass,
      body: {
        columns: ['customize_stelle_options'],
        id: `general_configuration_${owner}`,
      },
    })
    if (!ok) {return res.send({ ok, message, ...extra })}
    const {
      protocol,
      cast_movements_in_array: castInArray,
      headers,
      hotel_code: hotelCode,
      hotel_server: hotelServer,
      path_movements: path,
      port,
      sgs,
      token: clientToken,
    } = get(gc, 'customize_stelle_options', {})
    let getMovements = {
      active_checkins_only: Boolean(activeOnly),
      date_from: dateFrom,
      date_to: dateTo,
      add_extra: true,
    }
    if (castInArray) {getMovements = [getMovements]}
    const data =
      {
        clientToken,
        hotelCode,
        get_movements: getMovements,
      }
    const url = `${protocol}://${hotelServer}${port ? `:${port}` : ''}${path}`
    log.debug('hotel url:', url)
    const config = {
      method: 'post',
      url,
      headers,
      data,
    }
    const results = []
    const { data: { movements } } = await axios(config)
    for (let movement of movements) {
      // eslint-disable-next-line no-unused-vars
      const { day_prices, customers, ...parent } = movement
      for (let customer of customers) {
        if (movement.room_code) {
          const reservationHolder = findIndex(movement.reservation_holders, value => value.pms_customer_id === customer.pms_customer_id) > -1
          if (sgs) {
            parent.breakfast = true
            parent.lunch = parent.service_type === 'FB'
            parent.dinner = parent.service_type === 'FB' || parent.service_type === 'HB'
            parent.all_inclusive = false
          }
          const master = sgs ? customer.IntestatarioSN : !('pms_familyRep_id' in customer)
          const item = {
            customer,
            master: Boolean(master),
            name: customer.name || '',
            parent,
            pms_customer_id: customer.pms_customer_id,
            reservation_holder: reservationHolder,
            room_code: movement.room_code,
            room_number: movement.room_number ? movement.room_number : movement.room_code,
            surname: customer.surname || '',
          }
          if (sgs && activeOnly) {
            (customer.checkin_effective && !customer.checkout_effective) && results.push(item)
          } else {
            results.push(item)
          }
        }
      }
    }
    res.send({ ok: true, results: results })
  })
}

export default {
  addRouters,
}
