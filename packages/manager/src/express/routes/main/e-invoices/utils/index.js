import { couchQueries } from '@adapter/io'
import get from 'lodash/get'
import reduce from 'lodash/reduce'
import isString from 'lodash/isString'
import moment from 'moment'
import xmlbuilder from 'xmlbuilder'
import { numeric } from '@adapter/common'

const knex = require('knex')({ client: 'mysql' })

/* eslint-disable sort-keys */
export async function createEInvoiceXML (connClass, owner, paymentObj) {
  const collection = connClass.astenposBucketCollection
  const bucketName = connClass.astenposBucketName
  const { content } = await collection.get(`general_configuration_${owner}`)
  const companyData = get(content, 'company_data')
  let payment
  if (isString(paymentObj)) {
    const statement = knex
      .from(knex.raw(`\`${bucketName}\` buc USE KEYS '${paymentObj}'`))
      .select(knex.raw('buc.*, mode.payment_mode'))
      .joinRaw(`LEFT JOIN \`${bucketName}\` mode ON KEYS buc.income_id`)
    const {
      ok,
      results,
      message,
      info,
    } = await couchQueries.exec(statement.toQuery(), connClass.cluster)
    if (!ok) {return { ok, message, info }}
    const [firstPayment] = results
    if (!firstPayment) {return { ok: false, message: 'not found', errCode: 404 }}
    payment = firstPayment
  } else {
    payment = paymentObj
  }
  const longDecimal = 7
  if (!companyData) {return { ok: false, message: 'company data missing', errCode: 404 }}
  const { fte } = companyData
  if (!fte) {return { ok: false, message: 'fte missing', errCode: 404 }}
  const { pedix: postfix = '', prefix = '', useSDI } = fte
  const { date, number, customer } = payment
  const year = parseInt(date.substring(0, 4), 10)
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'Z']
  const index = letters[year % letters.length]
  let sendingCounter = `${prefix}${index}${number}${postfix}`
  const { sdi, split_payment: splitPayment } = customer
  const sdi_ = sdi && useSDI ? customer.sdi : '0000000'
  let foreign = customer.state.toUpperCase() !== 'IT' ? 'XXXXXXX' : sdi_
  let fatturaElettronicaHeader = {
    DatiTrasmissione: {
      IdTrasmittente: {
        IdPaese: 'IT',// hardcoded aruba
        IdCodice: '01879020517',// hardcoded aruba
      },
      ProgressivoInvio: sendingCounter,
      FormatoTrasmissione: 'FPR12',
      CodiceDestinatario: foreign,
    },
    CedentePrestatore: {
      DatiAnagrafici: {
        IdFiscaleIVA: {
          IdPaese: fte.IdPaese,// da general settings da cd.fe
          IdCodice: companyData.iva,
        },
        CodiceFiscale: companyData.cf.toUpperCase(),
        Anagrafica: {
          Denominazione: companyData.name,
        },
        RegimeFiscale: fte.RegimeFiscale ? fte.RegimeFiscale : 'RF01',// da general settings, da companyData.fe
      },
      Sede: {
        Indirizzo: companyData.address,
        CAP: companyData.zip_code,
        Comune: companyData.city,
        Provincia: fte.Provincia,// attenzione 2 caratteri, da companyData.fe
        Nazione: fte.Nazione,// attenzione 2 caratteri, da companyData.fe
      },
    },
    CessionarioCommittente: {
      DatiAnagrafici: {
        IdFiscaleIVA: {
          IdPaese: customer.state.toUpperCase(),
          IdCodice: customer.iva,
        },
        CodiceFiscale: customer.cf,
        Anagrafica: {
          Denominazione: customer.company,
        },
      },
      Sede: {
        Indirizzo: customer.address,
        CAP: customer.zip_code,
        Comune: customer.city,
        Provincia: customer.prov,
        Nazione: customer.state,
      },
    },
  }
  
  if (customer.state.toUpperCase() !== 'IT' || customer.cf === customer.iva) {// evita errore cf - iva non coerenti
    delete fatturaElettronicaHeader.CessionarioCommittente.DatiAnagrafici.CodiceFiscale
  }
  if (!companyData.cf) {
    delete fatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.CodiceFiscale
  }
  let fatturaElettronicaBody = {
    DatiGenerali: {
      DatiGeneraliDocumento: {
        TipoDocumento: 'TD01',
        Divisa: fte.Divisa ? fte.Divisa : 'EUR',// attenzione 3 caratteri capital, da companyData.fe
        Data: moment(payment.date, 'YYYYMMDDHHmmssSSS').format('YYYY-MM-DD'),
        Numero: `${prefix}${number}${postfix}`,
      },
    },
    DatiBeniServizi: {
      DettaglioLinee: [],
      DatiRiepilogo: [],
    },
  }
  
  let vats = {}
  
  let rowIndex = 0
  if (payment.covers > 0) {
    const vatForCovers = 10
    //remove vat
    const singlePrice = payment.cover_price / (1 + (vatForCovers / 100))
    if (!vats['VAT_DEPARTMENT_3']) {// hardcoded coperti on vat_department 3 (iva al 10%)
      vats['VAT_DEPARTMENT_3'] = {
        total: 0,
        vat: 0,
        display: numeric.printDecimal(vatForCovers),
      }
    }
    vats['VAT_DEPARTMENT_3'].total += singlePrice * payment.covers / 1000
    vats['VAT_DEPARTMENT_3'].vat += (payment.cover_price * payment.covers / 1000) - (singlePrice * payment.covers / 1000)
    fatturaElettronicaBody.DatiBeniServizi.DettaglioLinee.push({
      NumeroLinea: ++rowIndex,
      Descrizione: 'Coperto',
      Quantita: numeric.printDecimal(payment.covers),
      PrezzoUnitario: numeric.printDecimal(singlePrice / 1000, longDecimal),
      PrezzoTotale: numeric.printDecimal(singlePrice * payment.covers / 1000, longDecimal),
      AliquotaIVA: numeric.printDecimal(vatForCovers),
    })
  }
  for (let entry of payment.entries) {
    const priceForSkip = entry.product_price * entry.product_qta
    const variantForSkip = reduce(entry.orderVariants, function (sum, num) {
      return num.variant_price * num.variant_qta * entry.product_qta + sum
    }, 0)
    
    if (entry.product_skip_fiscal) {
      const totSkip = priceForSkip + variantForSkip
      payment.final_price -= totSkip
      payment.total_price -= totSkip
      continue
    }
    
    let fullSinglePrice = entry.product_price
    let c2 = {
      var: entry.orderVariants,
      totale: reduce(entry.orderVariants, function (sum, num) {
        return (num.variant_price * num.variant_qta) + sum
      }, 0),
    }
    fullSinglePrice += c2.totale
    
    // togli vat
    const singlePrice = fullSinglePrice / (1 + (entry.vat_department.iva / 100))
    
    if (!vats[entry.vat_department._id]) {
      vats[entry.vat_department._id] = {
        total: 0,
        vat: 0,
        display: numeric.printDecimal(entry.vat_department.iva),
      }
    }
    vats[entry.vat_department._id].total += singlePrice * entry.product_qta / 1000
    vats[entry.vat_department._id].vat += (fullSinglePrice * entry.product_qta / 1000) - (singlePrice * entry.product_qta / 1000)
    vats[entry.vat_department._id].natura = entry.vat_department.natura ? entry.vat_department.natura : 'N1'
    vats[entry.vat_department._id].rif_norm = entry.vat_department.rif_norm ? entry.vat_department.rif_norm : 'Escluso Art. 15 DPR 633/72'
    vats[entry.vat_department._id].iva = entry.vat_department.iva
    const detailLine = {
      NumeroLinea: ++rowIndex,
      Descrizione: entry.product_display.replace('€', 'Euro'),
      Quantita: numeric.printDecimal(entry.product_qta),
      PrezzoUnitario: numeric.printDecimal(singlePrice / 1000, longDecimal),
      PrezzoTotale: numeric.printDecimal(singlePrice * entry.product_qta / 1000, longDecimal),
      AliquotaIVA: numeric.printDecimal(entry.vat_department.iva),
    }
    if (entry.vat_department.iva === 0) {
      detailLine['Natura'] = entry.vat_department.natura ? entry.vat_department.natura : 'N1'
    }
    fatturaElettronicaBody.DatiBeniServizi.DettaglioLinee.push(detailLine)
  }
  const newFinal = payment.total_price - (payment.discount_price || 0)
  fatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.ImportoTotaleDocumento = numeric.printDecimal(newFinal / 1000)
  // aggiungi sconto come ultima riga
  if (payment.discount && payment.discount_price > 0) {
    let vatForDiscount = payment.discount.vat_department
    if (vatForDiscount == null) { // if missing (for old invoice, keep vat3, 10%
      vatForDiscount = {
        _id: 'VAT_DEPARTMENT_3',
        iva: 10,
      }
    }
    let discount = -payment.discount_price
    //remove vat
    const singlePrice = discount / (1 + (vatForDiscount.iva / 100))
    if (!vats[vatForDiscount._id]) {
      vats[vatForDiscount._id] = {
        total: 0,
        vat: 0,
        display: numeric.printDecimal(vatForDiscount.iva),
      }
    }
    vats[vatForDiscount._id].total += singlePrice / 1000
    vats[vatForDiscount._id].vat += (discount / 1000) - (singlePrice / 1000)
    fatturaElettronicaBody.DatiBeniServizi.DettaglioLinee.push({
      NumeroLinea: ++rowIndex,
      Descrizione: 'Sconto',
      Quantita: numeric.printDecimal(1),
      PrezzoUnitario: numeric.printDecimal(singlePrice / 1000, longDecimal),
      PrezzoTotale: numeric.printDecimal(singlePrice / 1000, longDecimal),
      AliquotaIVA: numeric.printDecimal(vatForDiscount.iva),
    })
  }
  let vat_ = 0
  for (let vat in vats) {
    let datiSum = {
      AliquotaIVA: vats[vat].display,
      ImponibileImporto: numeric.printDecimal(vats[vat].total),
      Imposta: numeric.printDecimal(vats[vat].vat),
    }
    if (splitPayment) {
      vat_ += vats[vat].vat
      datiSum['EsigibilitaIVA'] = 'S'
    }
    if (vats[vat].iva === 0) {
      datiSum = {
        AliquotaIVA: vats[vat].display,
        Natura: vats[vat].natura,
        ImponibileImporto: numeric.printDecimal(vats[vat].total),
        Imposta: numeric.printDecimal(vats[vat].vat),
        RiferimentoNormativo: vats[vat].rif_norm,
      }
    }
    fatturaElettronicaBody.DatiBeniServizi.DatiRiepilogo.push({
      ...datiSum,
    })
  }
  fatturaElettronicaBody['DatiPagamento'] = {
    CondizioniPagamento: 'TP02',//hardcoded x ora, means Pagamento Completo
    DettaglioPagamento: {
      ModalitaPagamento: payment.payment_mode ? payment.payment_mode : 'MP01',//da payment.income, dentro income
      ImportoPagamento: numeric.printDecimal(newFinal / 1000 - vat_),
    },
  }
  const xml = {
    'p:FatturaElettronica': {
      '@versione': 'FPR12',
      '@xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
      '@xmlns:p': 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2',
      '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@xsi:schemaLocation': 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2',
      FatturaElettronicaHeader: fatturaElettronicaHeader,
      FatturaElettronicaBody: fatturaElettronicaBody,
    },
  }
  const feed = xmlbuilder.create(xml, { encoding: 'UTF-8' })
  return { buf: new Buffer.from(feed.toString()), id: `IT${companyData.iva}_${sendingCounter}` }
}

/* eslint-enable  */
