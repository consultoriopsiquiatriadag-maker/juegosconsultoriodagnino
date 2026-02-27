# Tablero rotativo (tipo FIDS) – Noticias OMS / METAR-TAF / Dato OMS

## Qué hace
Agrega un zócalo debajo de “Instalar como app” que rota automáticamente entre:
1) Noticias OMS (filtradas por palabras clave de salud mental)
2) Clima aeronáutico METAR/TAF para SABE/SAEZ/SARE
3) Dato OMS (GHO): prevalencia poblacional estimada de depresión (%), para WLD/ARG/JPN/ESP/CHN/USA

No requiere admin: se actualiza solo desde fuentes públicas.

## Archivos
- `partials/home-zocalos.html` → reemplazar tu parcial actual (incluye el nuevo zócalo)
- `assets/js/fids-board.js` → JS del tablero (rotación, modal, refresco)
- `netlify/functions/fids.js` → Netlify Function que agrega/normaliza datos (evita CORS, cache 10 min)
- `index.html` → agrega el script `assets/js/fids-board.js` después de `assets/js/app.js`

## Cómo integrar (rápido)
1) Copiá `netlify/functions/fids.js` a tu repo.
2) Copiá `assets/js/fids-board.js` a tu repo.
3) Reemplazá `partials/home-zocalos.html` por el incluido.
4) En `index.html`, asegurate de tener:
   `<script src="assets/js/fids-board.js?v=1"></script>` (después de app.js)
5) Deploy en Netlify.

## Nota
AviationWeather no permite CORS, por eso usamos Netlify Function. Si la función falla, el zócalo muestra “sin datos” y el botón “Actualizar” vuelve a intentar.
