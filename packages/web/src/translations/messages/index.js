import { defineMessages } from 'react-intl'

export const messages = defineMessages({
  role_customer: {
    id: 'role.role_customer',
    defaultMessage: 'Cliente',
  },
  role_admin: {
    id: 'role.role_admin',
    defaultMessage: 'Amministratore',
  },
  menu_closing_day: {
    id: 'menu.closing_day',
    defaultMessage: 'Chiusure di giornata',
  },
  date_range_start: {
    id: 'date_range.start_date',
    defaultMessage: 'Inizio',
  },
  date_range_end: {
    id: 'date_range.end_date',
    defaultMessage: 'Fine',
  },
  ECONNREFUSED: {
    id: 'error.ECONNREFUSED',
    defaultMessage: 'Connessione rifiutata!',
  },
  MISSINGPARAMETERS: {
    id: 'error.MISSINGPARAMETERS',
    defaultMessage: 'Parametri obbligatori mancanti: {parameters}',
  },
  common_all: {
    id: 'common.all',
    defaultMessage: 'Tutti',
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
  LOGIN_WRONG_CREDENTIALS: {
    id: 'auth.login.wrong_credentials',
    defaultMessage: 'Nome utente o password errati!',
  },
})
