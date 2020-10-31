import { defineMessages } from 'react-intl'

export const messages = defineMessages({
  network_error: {
    id: 'general.network_error',
    defaultMessage: 'Errore di rete!',
  },
  username_required: {
    id: 'auth.login.username_required',
    defaultMessage: 'Nome utente obbligatorio!',
  },
  password_required: {
    id: 'auth.login.password_required',
    defaultMessage: 'Password obbligatoria!',
  },
  LOGIN_WRONG_CREDENTIALS: {
    id: 'auth.login.wrong_credentials',
    defaultMessage: 'Nome utente o password errati!',
  },
})
