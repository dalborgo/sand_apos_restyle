const emailDefinitions = {
  IT: {
    SIGNUP_MAIL: {
      subject: 'Next Astenpos - Conferma registrazione',
      body: (name, code) => `<pre>Conferma registrazione struttura "${name}".
Codice accesso: ${code}
</pre>`,
    },
    FORGOT_MAIL: {
      subject: 'Next Astenpos - Recupero codice accesso',
      body: (name, code) => `<pre>Hai richiesto il codice per l'accesso alla struttura "${name}".
Codice accesso: ${code}
</pre>`,
    },
  },
}

export default emailDefinitions
