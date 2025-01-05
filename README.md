è necessario creare un database utilizzando lo schema contenuto in `server/database/database_schema.sql`.
Se si utilizza l'interfaccia da linea di comando di mysql, è sufficiente eseguire:

```bash
mysql -u root -p < server/database/database_schema.sql

```

> **_NOTE:_** le credenziali del database non sono contenute nel codice per motivi di versatilità e sicurezza.

risulta dunque necessario creare un file .env nella root del progetto con il seguente contenuto:

```bash
DB_HOST = < indirizzo database >
DB_USER = < username database >
DB_PASSWORD = < password database >
DB_NAME = note_app
JWT_SECRET = < genera jwt con utils/gen_jwt.sh > 
```

e installare le dipendenze con `npm install`.
dopodichè sarà possibile avviare il server tramite `npm run server` o `node server/server.js`.
