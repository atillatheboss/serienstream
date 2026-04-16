# SerienStream Web-App

Web-UI zum Suchen auf [s.to](https://s.to) und [aniworld.to](https://aniworld.to) – inkl. eingebautem CORS-Proxy.

Basierend auf der [SerienStreamAPI](https://github.com/IcySnex/SerienStreamAPI) von IcySnex.

## Deploy auf Render

1. Dieses Repo auf GitHub pushen
2. Auf [render.com](https://render.com) → **New Web Service**
3. GitHub-Repo verbinden
4. Einstellungen:
   - **Environment:** Docker
   - **Port:** 10000 (wird automatisch erkannt)
5. **Deploy** klicken – fertig.

## Lokaler Start

```bash
node proxy.js
# → http://localhost:10000
```

## Docker lokal

```bash
docker build -t serienstream .
docker run -p 10000:10000 serienstream
# → http://localhost:10000
```

## Hinweis

Diese App dient ausschließlich Bildungszwecken.  
Das Herunterladen oder Streamen urheberrechtlich geschützter Inhalte ohne Erlaubnis kann in deinem Land illegal sein.
