## New astenpos

#### Browser

- quando si ripreme aggiorna il documento perché aggiorna la cache
    - 2 soluzioni
        - pulizia cache (dopo modifiche) per forzare un refresh totale
            - non vedi subito il documento ma non hai la sensazione di un documento che ti si aggiorna "tra le mani" (
              esperienza sopportabile ma non è il massimo)
        - optimistic response che aggiorna la cache (miglior esperienza per l'utente)
- filtro con channel
- tasto scroll top
  ##### Creazione documento
    - dare errore se si crea/modifica non compatibile con il selector corrente
    - sempre controllo di coerenza `id` e `owner`

#### Closing Day

- ~~Standard Header~~
- default properties
- new Loader
- ~~Summary~~

#### Payment Change Dialog

- distribuire bene i tasti in fullscreen

#### Select Code

- ~~togliere select se c'è un'unica opzione.~~

#### Date Range Selector

- per mobile versione specifica

### Table Toolbar search

- studiare per portarla fuori

### macinino aggiornamento fatture

- https://ws.fatturazioneelettronica.aruba.it/services/invoice/out/findByUsername?username=Asten2018&startDate=2000-01-01&endDate=2022-01-01&countrySender=IT&vatcodeSender=02829270236&size=100
  - una richiesta da 100 fatture costa una ricerca (max 12 al minuto)
  - si cerca per partita iva del cliente  