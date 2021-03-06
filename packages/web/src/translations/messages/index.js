import { defineMessages } from 'react-intl'

export const messages = defineMessages({
  'dropzone_file-invalid-type': {
    id: 'dropzone.file_invalid_type',
    defaultMessage: 'File "{name}" di tipo {type} non accettato!',
  },
  'dropzone_file-too-large': {
    id: 'dropzone.file_too_large',
    defaultMessage: 'File "{name}" di {size} è troppo grande!',
  },
  management_import_processed_records: {
    id: 'management.import.processed_records',
    defaultMessage: 'Salvati',
  },
  management_export_delete_success: {
    id: 'management.export.delete_success',
    defaultMessage: 'Eliminati {count} documenti!',
  },
  management_export_confirm_delete_message: {
    id: 'management.export.confirm_delete_message',
    defaultMessage: 'Stai eliminando {count} {type}!',
  },
  management_hotel_confirm_align_message: {
    id: 'management.export.confirm_align_message',
    defaultMessage: 'Verranno allineati i prodotti con il server 5Stelle.',
  },
  management_import_total_modifications: {
    id: 'management.import.total_modifications',
    defaultMessage: 'Modifiche',
  },
  management_hotel_align_button: {
    id: 'management.align_button',
    defaultMessage: 'Allinea',
  },
  management_hotel_status: {
    id: 'management.hotel.status',
    defaultMessage: 'Stato',
  },
  management_hotel_status_1: {
    id: 'management.hotel.status_1',
    defaultMessage: 'Ok',
  },
  management_hotel_status_2: {
    id: 'management.hotel.status_2',
    defaultMessage: 'Operazione fallita',
  },
  management_hotel_status_3: {
    id: 'management.hotel.status_3',
    defaultMessage: 'Impossibile cancellare un prodotto movimentato',
  },
  management_hotel_status_10: {
    id: 'management.hotel.status_10',
    defaultMessage: 'Reparto Fiscale Invalido',
  },
  management_hotel_status_11: {
    id: 'management.hotel.status_11',
    defaultMessage: 'Categoria invalida',
  },
  management_hotel_status_20: {
    id: 'management.hotel.status_20',
    defaultMessage: 'ID vietato',
  },
  management_hotel_status_21: {
    id: 'management.hotel.status_21',
    defaultMessage: 'Descrizione mancante',
  },
  management_hotel_status_22: {
    id: 'management.hotel.status_22',
    defaultMessage: 'Prezzo mancante',
  },
  management_hotel_status_23: {
    id: 'management.hotel.status_23',
    defaultMessage: 'Codice duplicato',
  },
  management_hotel_status_24: {
    id: 'management.hotel.status_24',
    defaultMessage: 'Prodotto duplicato',
  },
  management_hotel_status_30: {
    id: 'management.hotel.status_30',
    defaultMessage: 'Cancellazione prodotto non trovato',
  },
  management_hotel_status_31: {
    id: 'management.hotel.status_31',
    defaultMessage: 'Cancellazione prodotto non identificabile',
  },
  management_hotel_status_40: {
    id: 'management.hotel.status_40',
    defaultMessage: 'Richiesta JSON non corretta',
  },
  management_hotel_status_50: {
    id: 'management.hotel.status_50',
    defaultMessage: 'Stato sconosciuto',
  },
  management_hotel_id: {
    id: 'management.hotel.id',
    defaultMessage: 'Id',
  },
  management_hotel_status_update_text: {
    id: 'management.hotel.status_update_text',
    defaultMessage: 'Da modificare in 5Stelle',
  },
  management_hotel_status_new_text: {
    id: 'management.hotel.status_new_text',
    defaultMessage: 'Da aggiungere in 5Stelle',
  },
  management_hotel_status_delete_text: {
    id: 'management.hotel.status_delete_text',
    defaultMessage: 'Da disaccoppiare in 5Stelle',
  },
  management_hotel_status_update: {
    id: 'management.hotel.status_update',
    defaultMessage: 'modificato',
  },
  management_hotel_status_new: {
    id: 'management.hotel.status_new',
    defaultMessage: 'inserito',
  },
  management_hotel_status_delete: {
    id: 'management.hotel.status_delete',
    defaultMessage: 'disaccoppiato',
  },
  management_hotel_net_price: {
    id: 'management.hotel.net_price',
    defaultMessage: 'Prezzo',
  },
  management_import_total_creations: {
    id: 'management.import.total_creations',
    defaultMessage: 'Creazioni',
  },
  management_import_total_not_saved: {
    id: 'management.import.total_not_saved',
    defaultMessage: 'Errori',
  },
  management_import_total_records: {
    id: 'management.import.total_records',
    defaultMessage: 'Record totali',
  },
  management_import_error_EMPTY_FILE: {
    id: 'management.import.error_EMPTY_FILE',
    defaultMessage: 'File "{name}" vuoto!',
  },
  management_import_error_UNKNOWN_FILE: {
    id: 'management.import.error_UNKNOWN_FILE',
    defaultMessage: 'File "{name}" non riconosciuto!',
  },
  management_import_error_HEADER_MISSING: {
    id: 'management.import.error_HEADER_MISSING',
    defaultMessage: 'File "{name}" senza intestazione!',
  },
  management_import_error_EMPTY_VALUE: {
    id: 'management.import.error_EMPTY_VALUE',
    defaultMessage: 'Colonna "{column}" con valore nullo',
  },
  management_import_error_MISSING_COLUMN_DEFAULT_CATALOG: {
    id: 'management.import.error_MISSING_COLUMN_DEFAULT_CATALOG',
    defaultMessage: 'Colonna listino di default "{value}" non presente',
  },
  management_import_error_MISSING_VALUE: {
    id: 'management.import.error_MISSING_VALUE',
    defaultMessage: 'Valore "{value}" non presente in Astenpos',
  },
  management_import_error_MULTI_DEFAULT_CATALOG: {
    id: 'management.import.error_MULTI_DEFAULT_CATALOG',
    defaultMessage: 'Ci sono più listini di default',
  },
  management_import_error_MISSING_DEFAULT_CATALOG: {
    id: 'management.import.error_MISSING_DEFAULT_CATALOG',
    defaultMessage: 'Listino di default non presente in Astenpos',
  },
  management_import_error_MISSING_DEFAULT_CATALOG_PRICE: {
    id: 'management.import.error_MISSING_DEFAULT_CATALOG_PRICE',
    defaultMessage: 'Prezzo sul listino di default non valorizzato',
  },
  management_import_error_PRESENT_VALUE: {
    id: 'management.import.error_PRESENT_VALUE',
    defaultMessage: 'Valore "{value}" già presente in Astenpos',
  },
  management_import_error_DUPLICATE_VALUE: {
    id: 'management.import.error_DUPLICATE_VALUE',
    defaultMessage: 'Valore "{value}" duplicato alla riga {extra}',
  },
  reports_e_invoices_accepted: {
    id: 'reports.e_invoices.accepted',
    defaultMessage: 'In carico',
  },
  reports_e_invoices_customer_vat: {
    id: 'reports.e_invoices.customer_vat',
    defaultMessage: 'Partita iva',
  },
  reports_e_invoices_fiscal_code: {
    id: 'reports.e_invoices.fiscal_code',
    defaultMessage: 'Codice fiscale',
  },
  reports_e_invoices_company: {
    id: 'reports.e_invoices.company',
    defaultMessage: 'Azienda',
  },
  reports_e_invoices_address: {
    id: 'reports.e_invoices.address',
    defaultMessage: 'Indirizzo',
  },
  reports_e_invoices_zip: {
    id: 'reports.e_invoices.zip',
    defaultMessage: 'Cap',
  },
  reports_e_invoices_city: {
    id: 'reports.e_invoices.city',
    defaultMessage: 'Città',
  },
  reports_e_invoices_district: {
    id: 'reports.e_invoices.district',
    defaultMessage: 'Provincia',
  },
  reports_e_invoices_state: {
    id: 'reports.e_invoices.state',
    defaultMessage: 'Stato',
  },
  reports_e_invoices_sdi: {
    id: 'reports.e_invoices.sdi',
    defaultMessage: 'Sdi',
  },
  reports_e_invoices_split_payment: {
    id: 'reports.e_invoices.split_payment',
    defaultMessage: 'Scissione pagamenti',
  },
  reports_e_invoices_pec: {
    id: 'reports.e_invoices.pec',
    defaultMessage: 'Pec',
  },
  reports_e_invoices_contact: {
    id: 'reports.e_invoices.contact',
    defaultMessage: 'Contatto',
  },
  reports_e_invoices_download_xml: {
    id: 'reports.e_invoices.download_xml',
    defaultMessage: 'Scarica xml',
  },
  reports_e_invoices_send: {
    id: 'reports.e_invoices.send',
    defaultMessage: 'Invia',
  },
  reports_e_invoices_not_delivered: {
    id: 'reports.e_invoices.not_delivered',
    defaultMessage: 'Nel cassetto',
  },
  reports_e_invoices_not_delivered_long: {
    id: 'reports.e_invoices.not_delivered_long',
    defaultMessage: 'Nel cassetto fiscale del cliente',
  },
  reports_e_invoices_delivered: {
    id: 'reports.e_invoices.delivered',
    defaultMessage: 'Consegnata',
  },
  reports_e_invoices_refused: {
    id: 'reports.e_invoices.refused',
    defaultMessage: 'Scartata',
  },
  reports_e_invoices_new_state: {
    id: 'reports.e_invoices.new_state',
    defaultMessage: 'Aggiornato nuovo stato!',
  },
  reports_e_invoices_same_state: {
    id: 'reports.e_invoices.same_state',
    defaultMessage: 'Nessun aggiornamento',
  },
  reports_e_invoices_sent: {
    id: 'reports.e_invoices.sent',
    defaultMessage: 'Inviata',
  },
  reports_e_invoices_send_error: {
    id: 'reports.e_invoices.send_error',
    defaultMessage: 'Errore di invio',
  },
  reports_e_invoices_not_found: {
    id: 'reports.e_invoices.not_found',
    defaultMessage: 'File non trovato!',
  },
  reports_e_invoices_download_xml_zip: {
    id: 'reports.e_invoices.download_xml_zip',
    defaultMessage: 'Scarica zip',
  },
  cause_TokenExpiredError: {
    id: 'cause.TokenExpiredError',
    defaultMessage: 'Sessione scaduta!',
  },
  mode_INVOICE: {
    id: 'mode.INVOICE',
    defaultMessage: 'Fattura',
  },
  mode_CHECK: {
    id: 'mode.CHECK',
    defaultMessage: 'Scontrino',
  },
  mode_5STELLE: {
    id: 'mode.5STELLE',
    defaultMessage: 'Addebito',
  },
  mode_OTHER: {
    id: 'mode.OTHER',
    defaultMessage: 'Altro',
  },
  mode_PRECHECK: {
    id: 'mode.PRECHECK',
    defaultMessage: 'Preconto',
  },
  astenpos_type_CATEGORY: {
    id: 'astenpos.type_CATEGORY',
    defaultMessage: 'Categorie',
  },
  astenpos_type_CUSTOMER_ADDRESS: {
    id: 'astenpos.type_CUSTOMER_ADDRESS',
    defaultMessage: 'Clienti Asporto',
  },
  astenpos_type_PRODUCT: {
    id: 'astenpos.type_PRODUCT',
    defaultMessage: 'Prodotti',
  },
  astenpos_type_CATALOG: {
    id: 'astenpos.type_CATALOG',
    defaultMessage: 'Listini',
  },
  astenpos_type_VARIANT: {
    id: 'astenpos.type_VARIANT',
    defaultMessage: 'Varianti',
  },
  astenpos_type_TABLE: {
    id: 'astenpos.type_TABLE',
    defaultMessage: 'Tavoli',
  },
  astenpos_type_CUSTOMER: {
    id: 'astenpos.type_CUSTOMER',
    defaultMessage: 'Clienti',
  },
  common_cancel: {
    id: 'common.cancel',
    defaultMessage: 'annulla',
  },
  common_description: {
    id: 'common.description',
    defaultMessage: 'Descrizione',
  },
  common_category: {
    id: 'common.category',
    defaultMessage: 'Categoria',
  },
  common_product: {
    id: 'common.product',
    defaultMessage: 'Prodotto',
  },
  common_confirm: {
    id: 'common.confirm',
    defaultMessage: 'conferma',
  },
  common_confirm_operation: {
    id: 'common.confirm_operation',
    defaultMessage: 'Conferma operazione',
  },
  common_tot: {
    id: 'common.tot',
    defaultMessage: 'Tot',
  },
  common_username: {
    id: 'common.username',
    defaultMessage: 'Nome Utente',
  },
  common_undefined: {
    id: 'common.common_undefined',
    defaultMessage: 'Indefinito',
  },
  common_charge: {
    id: 'common.charge',
    defaultMessage: 'Addebito',
  },
  common_filename: {
    id: 'common.filename',
    defaultMessage: 'Filename',
  },
  common_file: {
    id: 'common.file',
    defaultMessage: 'File',
  },
  common_customer: {
    id: 'common.customer',
    defaultMessage: 'Cliente',
  },
  common_table: {
    id: 'common.table',
    defaultMessage: 'Tavolo',
  },
  common_select: {
    id: 'common.select',
    defaultMessage: 'Segli tipo',
  },
  common_other: {
    id: 'common.other',
    defaultMessage: 'Altro',
  },
  common_search: {
    id: 'common.search',
    defaultMessage: 'Cerca…',
  },
  common_exportMenu: {
    id: 'common.exportMenu',
    defaultMessage: 'Menu esportazione dati',
  },
  common_error: {
    id: 'common.error',
    defaultMessage: 'Errore',
  },
  common_exportTable: {
    id: 'common.exportTable',
    defaultMessage: 'Esporta',
  },
  common_delete: {
    id: 'common.delete',
    defaultMessage: 'Elimina',
  },
  common_type: {
    id: 'common.type',
    defaultMessage: 'Tipo',
  },
  common_settings: {
    id: 'common.settings',
    defaultMessage: 'Impostazioni',
  },
  common_language: {
    id: 'common.language',
    defaultMessage: 'Lingua',
  },
  common_dividedPayment: {
    id: 'common.dividedPayment',
    defaultMessage: 'Separato',
  },
  common_number: {
    id: 'common.number',
    defaultMessage: 'Numero',
  },
  common_closedBy: {
    id: 'common.closedBy',
    defaultMessage: 'Chiuso da',
  },
  language_it: {
    id: 'language.it',
    defaultMessage: 'Italiano',
  },
  language_de: {
    id: 'language.de',
    defaultMessage: 'Tedesco',
  },
  'language_en-gb': {
    id: 'language.en-gb',
    defaultMessage: 'Inglese',
  },
  common_theme: {
    id: 'common.theme',
    defaultMessage: 'Tema',
  },
  common_price: {
    id: 'common.price',
    defaultMessage: 'Prezzo',
  },
  common_room: {
    id: 'common.room',
    defaultMessage: 'Sala',
  },
  role_customer: {
    id: 'role.role_customer',
    defaultMessage: 'Cliente',
  },
  role_admin: {
    id: 'role.role_admin',
    defaultMessage: 'Amministratore',
  },
  sub_reports: {
    id: 'sub.reports',
    defaultMessage: 'Report',
  },
  sub_management: {
    id: 'sub.management',
    defaultMessage: 'Gestione',
  },
  menu_closing_day: {
    id: 'menu.closing_day',
    defaultMessage: 'Chiusure di giornata',
  },
  menu_import: {
    id: 'menu.import',
    defaultMessage: 'Import/export',
  },
  menu_hotel: {
    id: 'menu.hotel',
    defaultMessage: 'Hotel',
  },
  menu_e_invoices: {
    id: 'menu.e_invoices',
    defaultMessage: 'Fatture elettroniche',
  },
  menu_running_tables: {
    id: 'menu.running_tables',
    defaultMessage: 'Tavoli in corso',
  },
  menu_closed_tables: {
    id: 'menu.closed_tables',
    defaultMessage: 'Tavoli chiusi',
  },
  menu_sold_items: {
    id: 'menu.sold_items',
    defaultMessage: 'Venduto',
  },
  date_range_start: {
    id: 'date_range.start_date',
    defaultMessage: 'Inizio',
  },
  date_range_select_title: {
    id: 'date_range.select_title',
    defaultMessage: 'Scegli date',
  },
  date_range_end: {
    id: 'date_range.end_date',
    defaultMessage: 'Fine',
  },
  ECONNREFUSED: {
    id: 'error.ECONNREFUSED',
    defaultMessage: 'Connessione rifiutata!',
  },
  MISSING_PARAMETERS: {
    id: 'error.MISSING_PARAMETERS',
    defaultMessage: 'Parametri obbligatori mancanti: {parameters}',
  },
  INVALID_DOC_UPDATE: {
    id: 'error.INVALID_DOC_UPDATE',
    defaultMessage: 'Campo "set" o "unset" obbligatorio!',
  },
  common_all: {
    id: 'common.all',
    defaultMessage: 'Tutti',
  },
  common_total: {
    id: 'common.total',
    defaultMessage: 'Totale',
  },
  common_covers: {
    id: 'common.covers',
    defaultMessage: 'Coperti',
  },
  common_quantity: {
    id: 'common.quantity',
    defaultMessage: 'Qta',
  },
  common_date: {
    id: 'common.date',
    defaultMessage: 'Data',
  },
  common_building: {
    id: 'common.building',
    defaultMessage: 'Struttura',
  },
  common_cashed: {
    id: 'common.income',
    defaultMessage: 'Incassato',
  },
  common_type_document: {
    id: 'common.type_of_document',
    defaultMessage: 'Tipo di Documento',
  },
  common_type_payment: {
    id: 'common.type_of_payment',
    defaultMessage: 'Tipo di Pagamento',
  },
  common_discounts: {
    id: 'common.discounts',
    defaultMessage: 'Sconti',
  },
  common_reversals: {
    id: 'common.reversals',
    defaultMessage: 'Storni',
  },
  network_error: {
    id: 'general.network_error',
    defaultMessage: 'Errore di rete: servizio non raggiungibile!',
  },
  installation: {
    id: 'auth.login.installation',
    defaultMessage: 'Installazione',
  },
  error_to_fetch_codes: {
    id: 'auth.login.error_to_fetch_codes',
    defaultMessage: 'Impossibile caricare i codici clienti!',
  },
  username_required: {
    id: 'auth.login.username_required',
    defaultMessage: 'Nome utente obbligatorio!',
  },
  password_required: {
    id: 'auth.login.password_required',
    defaultMessage: 'Password obbligatoria!',
  },
  installation_required: {
    id: 'auth.login.installation_required',
    defaultMessage: 'Installazione obbligatoria!',
  },
  settings_responsive_fonts: {
    id: 'toolbar.settings.responsive_fonts',
    defaultMessage: 'Font responsivi',
  },
  LOGIN_WRONG_CREDENTIALS: {
    id: 'auth.login.wrong_credentials',
    defaultMessage: 'Nome utente o password errati!',
  },
})
