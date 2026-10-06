# ASTREA — portale e Sportello Tecnologico

Next.js 16 App Router, React 19, TypeScript, Tailwind 4, Prisma 7.10 e PostgreSQL. Il design originale e la migration `20260930114327_init_astrea` sono mantenuti. La nuova migration aggiunge solo i contatori condivisi per proteggere l’autenticazione.

## Sviluppo

Richiede Node.js 24 e PostgreSQL. Non sovrascrivere il `.env` esistente. Su una nuova macchina configura privatamente le variabili indicate in `.env.example`, che contiene esclusivamente nomi senza credenziali.

```sh
npm install
npm run db:validate
npm run db:generate
npm run db:deploy
npm run dev
```

`DATABASE_URL` ha precedenza; `DATABASE_PUBLIC_URL` è il fallback dell’applicazione locale. Prisma CLI usa `DATABASE_URL`, come nella configurazione originale `prisma7.config.ts`. Mantieni gli indirizzi Railway privati/pubblici nell’ambiente corretto, senza cambiare credenziali. `APP_URL` deve essere l’origine esatta del portale, con HTTPS in produzione.

L’installazione genera il client Prisma ma non applica migration. La build non richiede una connessione al database. `db:deploy` modifica il database dell’ambiente: eseguirlo solo dopo aver verificato le migration. Non usare reset o `db push` sul database esistente.

## Autenticazione

Registrazione pubblica esclusivamente per cittadini e imprese, con accettazioni separate di privacy e termini. Imprese: ragione sociale, Partita IVA italiana di 11 cifre e nome/cognome referente obbligatori.

Password Argon2id, minimo 12 e massimo 128 caratteri, senza troncamento. Cookie di sessione HttpOnly, SameSite=Lax, Secure e prefisso `__Host-` in produzione. Token casuali nel browser e solo hash SHA-256 nel database; durata massima sette giorni. Ruoli, account attivi e abilitazione professionale sono verificati a ogni richiesta protetta. Logout e reset revocano le sessioni; la disabilitazione professionale impedisce immediatamente l’accesso.

Recupero password, verifica email e inviti usano token monouso, validi un’ora e salvati solo come hash. Le API di modifica richiedono Origin uguale ad APP_URL. Il rate limit è condiviso tra repliche tramite PostgreSQL.

### Google

Configura `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` per un client OAuth web. Callback: `APP_URL/api/auth/google/callback`. Il pulsante appare solo quando configurato.

Il flusso verifica state, PKCE e nonce. `jose` verifica firma, issuer, audience e scadenza del token. Non vengono conservati token Google. Non vengono collegati automaticamente account con password aventi la stessa email: questi accedono con password. Gli account esistenti possono collegare Google esplicitamente dalla dashboard dopo il login, con verifica della sessione corrente e della stessa email; il ruolo non cambia. I nuovi utenti Google completano tipo di account, dati e consensi prima di aprire pratiche. Riferimento: [Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect).

### Email e professionisti

Configura SMTP_HOST, SMTP_PORT, SMTP_FROM e, quando necessari, SMTP_USER e SMTP_PASSWORD. Porta 465: TLS diretto; porta 587: STARTTLS obbligatorio (solo i server di test su localhost sono esentati). Nessun link o token viene stampato nei log.

Solo ASTREA crea professionisti. Gli account nascono disabilitati e senza password, con invito email per impostarla. ASTREA abilita l’accesso dall’elenco. Se l’invio fallisce, l’account rimane disabilitato e l’invito può essere reinviato.

Crea il primo amministratore dal terminale dell’ambiente corretto:

```sh
npm run admin:create
```

Il comando chiede email e password con input nascosto. Non prende password dalla riga di comando e non promuove account esistenti. Non vengono creati account dimostrativi in produzione.

## Pratiche

Percorso obbligatorio: invio → valutazione → presa in carico → eventuale assegnazione ASTREA → gestione → risoluzione → chiusura. Solo ASTREA assegna professionisti dopo la presa in carico e può riaprire una pratica chiusa per una nuova valutazione.

| Profilo | Accesso | Operazioni |
|---|---|---|
| Cittadino/impresa | Proprie pratiche | Creazione, messaggi pubblici, allegati, profilo |
| Professionista abilitato | Pratiche assegnate | Messaggi, note interne, allegati, attività e risoluzione consentite |
| Amministratore ASTREA | Tutte le pratiche | Stati, priorità, assegnazione, note, gestione professionisti e utenti |

Il richiedente non può scegliere il professionista né cambiare stato/priorità. Il professionista non può prendere in carico, assegnare, chiudere o riaprire. I filtri admin comprendono stato, categoria, priorità, email richiedente e professionista; gli elenchi sono paginati.

Le modifiche ricontrollano l’autorizzazione dentro la transazione e bloccano la pratica durante l’aggiornamento. Note interne e relativi eventi sono esclusi dalle query dei richiedenti. Il download verifica anche la visibilità del messaggio collegato. Le pratiche chiuse non accettano messaggi o allegati.

## Allegati

Solo storage S3 compatibile e privato, senza filesystem effimero. Configura S3_BUCKET, S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY; S3_FORCE_PATH_STYLE=true se richiesto dal provider. Le credenziali devono avere accesso limitato al bucket, che non deve essere pubblico.

PDF, JPEG e PNG con estensione, MIME e firma binaria coerenti. Massimo 10 MB per documento, 50 documenti e 100 MB per pratica. Il corpo HTTP viene limitato durante la lettura anche senza Content-Length. Su errore di registrazione viene tentata la rimozione dell’oggetto già caricato.

Il download autorizzato genera URL firmati validi 60 secondi, con disposizione attachment e contenuto octet-stream. Nessun URL pubblico viene salvato. Il riconoscimento del formato non sostituisce una scansione antivirus. Gli allegati caricati dalla UI sono visibili a tutti i soggetti autorizzati alla pratica; le note interne non offrono caricamento dalla UI.

## Pagine e contenuti

Tutte le route richieste sono presenti, con metadata, breadcrumb, navigazione mobile, focus visibile e salto al contenuto. `/notizie/technologia` mantiene il percorso richiesto; `/notizie/tecnologia` vi reindirizza. Sitemap e robots escludono le aree riservate.

Non sono stati inventati soci, partner, notizie o recapiti. Le sezioni editoriali non popolate lo dichiarano. Aggiorna `lib/public-content.ts` con contenuti verificati. CONTACT_EMAIL è un recapito istituzionale pubblico.

Privacy e termini sono bozze operative da completare e approvare prima dell’apertura pubblica, indicando dati del titolare, basi giuridiche, conservazione e fornitori effettivi. La presa visione della privacy non viene trattata come consenso generico a finalità ulteriori.

## Test

```sh
npm run db:validate
npm run db:generate
npm run lint
npm run typecheck
npm test
npm run build
npm run test:integration
npm audit
```

I test di integrazione richiedono la build. Avviano PGlite, SMTP locale e storage simulato sulle porte 55439–55442. Usano dati sintetici e configurazioni locali esplicite: non leggono `.env` e non usano Railway. Verificano route, registrazioni, accessi incrociati, flusso, note interne, allegati, reset, inviti, revoca e rate limit.

Google reale, consegna email reale e storage del provider richiedono collaudo nell’ambiente configurato. Gli override deepmerge-ts e mysql2 aggiornano dipendenze transitive vulnerabili mantenendo Prisma 7.10; validate, generate e test verificano la compatibilità. Evita aggiornamenti forzati che retrocedano Prisma.

La dipendenza vulnerabile braces è stata rimossa: un override limitato a @next/eslint-plugin-next sostituisce fast-glob con tinyglobby 0.2.17. Il plugin usa esclusivamente globSync con onlyDirectories, supportati dalla sostituzione; un test verifica directory singole, glob, array e risultati vuoti. Le regole Next restano attive. L’audit completo e quello di produzione risultano senza vulnerabilità alla verifica. Rivalutare questo override quando il plugin Next aggiorna la propria implementazione.

## Railway

`railway.json` conserva la configurazione per i servizi legacy. Per il nuovo servizio Railway, che non può attivare Config as Code, impostare direttamente nella piattaforma: builder Railpack, build `npm ci && npm run build`, pre-deploy `npm run db:deploy`, start `npm run start`, healthcheck `/api/health`, timeout 120 secondi e riavvio On Failure con massimo 3 tentativi. Next usa PORT fornita da Railway. L’healthcheck verifica la tabella della migration incrementale e restituisce solo errori generici. Riferimenti: [Next.js Railway](https://docs.railway.com/guides/nextjs), [healthcheck](https://docs.railway.com/deployments/healthchecks).

1. Collega il repository e seleziona il branch approvato. La versione dello Sportello è nel branch `development/astrea-sportello` (PR #1), fino alla sua integrazione in main.
2. Associa il PostgreSQL esistente; configura DATABASE_URL privatamente tramite riferimento Railway e APP_URL sul dominio HTTPS.
3. Configura Google, SMTP e bucket privato; non usare prefissi NEXT_PUBLIC_ per credenziali.
4. Verifica la migration incrementale e conserva il backup. La migration iniziale già applicata non va ricreata.
5. Crea il primo admin e completa contenuti istituzionali, privacy e termini.
6. Collauda in staging email reale, Google, bucket privato, cookie HTTPS, ruoli e isolamento delle pratiche.

Esegui periodicamente `npm run security:cleanup` nell’ambiente corretto: elimina solo sessioni, token e contatori scaduti, mai utenti, pratiche o documenti. La politica di conservazione delle pratiche va definita da ASTREA prima di introdurre cancellazioni automatiche.

Lo sviluppo e i test non effettuano deploy né migration sul database Railway di produzione.
