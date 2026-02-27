# DEPLOY REPORT — Consultorio Dr. Dagnino
**Fecha:** 2026-02-21
**Sitio:** Sala de espera virtual — Psiquiatría y Medicina Aeronáutica
**Tecnología:** HTML puro + CSS + JS Vanilla, SPA con `history.pushState`, PWA con Service Worker

---

## 1. Causa raíz del "Access Denied" / pantalla en blanco

### Causas técnicas corregidas en este reporte:

| # | Problema | Impacto | Estado |
|---|----------|---------|--------|
| 1 | `manifest.webmanifest` referenciaba `icon-192-maskable.png` e `icon-512-maskable.png` (no existían) | PWA no instalable, posible error en SW install | ✅ Corregido |
| 2 | `manifest.webmanifest` tenía `start_url: "./index.html"` y `scope: "./"` (relativo) | Problemas de scope en Netlify CDN | ✅ Corregido → `"/"` |
| 3 | `manifest.webmanifest` referenciaba screenshots inexistentes | Error silencioso en PWA | ✅ Removidas |
| 4 | Hero image con espacio en nombre: `dr-dagnino backup.webp` → URL: `%20` | Puede fallar en servidores Linux strict | ✅ Renombrada |
| 5 | `sw.js` referenciaba `apple-touch-icon.png` y `favicon.ico` (no existían) | SW install fallaba en NEVER_STALE | ✅ Creados |
| 6 | `_redirects` sin catch-all SPA — rutas sin archivos físicos daban 404 | 404 en rutas SPA | ✅ Agregado |
| 7 | `netlify.toml` sin headers de seguridad | Sin `X-Frame-Options`, etc. | ✅ Agregados |
| 8 | `img/profesionales-salud-mental.webp` y `img/otras-especialidades.webp` ausentes | Cards en equipo.html sin fondo | ✅ Creados |

### ⚠️ ACCIÓN PENDIENTE — Verificar en el Dashboard de Netlify:
> **La causa más frecuente de "Access Denied" en Netlify es la protección por contraseña activada en el dashboard.**
> Ir a: **Netlify Dashboard → Site → Site settings → Access control → Site protection**
> Si dice "Password protection: enabled" → desactivar o ingresar la contraseña.

---

## 2. Auditoría de rutas y referencias

### Tabla de referencias críticas

| Archivo | Referencia | ¿Existía? | Acción |
|---------|-----------|-----------|--------|
| `index.html` | `assets/img/dr-dagnino%20backup.webp` | Sí (con espacio) | Renombrada → `dr-dagnino-backup.webp` |
| `manifest.webmanifest` | `icon-192-maskable.png` | ❌ No | Creado (copia de icon-192.png) |
| `manifest.webmanifest` | `icon-512-maskable.png` | ❌ No | Creado (copia de icon-512.png) |
| `manifest.webmanifest` | `img/screenshot-mobile.jpg` | ❌ No | Removido del manifest |
| `manifest.webmanifest` | `img/screenshot-desktop.jpg` | ❌ No | Removido del manifest |
| `sw.js` | `/apple-touch-icon.png` | ❌ No | Creado (180x180 desde icon-192) |
| `sw.js` | `/favicon.ico` | ❌ No | Creado (32x32 desde icon-192) |
| `equipo.html` | `img/profesionales-salud-mental.webp` | ❌ No | Creado desde PNG fuente |
| `equipo.html` | `img/otras-especialidades.webp` | ❌ No | Creado desde PNG fuente |
| `equipo.html` | `img/centros-medicos-amigos.webp` | ✅ Sí | OK |

### Case-sensitivity (Linux/Netlify)
- Todos los archivos HTML/CSS/JS usan rutas en minúsculas → OK
- `Picsart_26-02-18_20-13-33-088.png` tiene mayúscula inicial → referenciada igual en HTML → OK (mientras sea consistente)
- `niño.jpg` tiene ñ en nombre → potencialmente problemático en algunos contextos

---

## 3. Optimización multimedia

### Imágenes optimizadas

| Archivo | Antes | Después | Reducción |
|---------|-------|---------|-----------|
| `assets/img/centros-medicos-amigos.png` → `.webp` | 2.5 MB | 116 KB | **95%** |
| `assets/img/otras-especialidades.png` → `.webp` | 2.5 MB | 120 KB | **95%** |
| `assets/img/profesionales-salud-mental.png` → `.webp` | 2.5 MB | 123 KB | **95%** |
| `asociados_salud_mental/maria-tiziana-fenochietto.png` | 7.4 MB | 257 KB + 14 KB webp | **96%** |
| `asociados_salud_mental/Picsart_26-02-18_20-13-33-088.png` | 4.1 MB | 339 KB + 18 KB webp | **91%** |
| `icon-512.png` | 350 KB | 250 KB | 29% |
| `icon-192.png` | 65 KB | 59 KB | 9% |
| `portada.png` | 222 KB | 199 KB | 10% |
| `assets/img/dr-dagnino-backup.webp` (renombrada) | 34 KB | 34 KB | — |

### Imágenes creadas

| Archivo nuevo | Tamaño | Propósito |
|---------------|--------|-----------|
| `favicon.ico` | 4 KB | Ícono de pestaña |
| `apple-touch-icon.png` | 53 KB | Ícono iOS (180x180) |
| `icon-192-maskable.png` | 59 KB | PWA maskable (fallback) |
| `icon-512-maskable.png` | 250 KB | PWA maskable (fallback) |
| `img/profesionales-salud-mental.webp` | 24 KB | Fondo card equipo.html |
| `img/otras-especialidades.webp` | 26 KB | Fondo card equipo.html |
| `assets/img/centros-medicos-amigos.webp` | 116 KB | Versión WebP optimizada |
| `assets/img/otras-especialidades.webp` | 120 KB | Versión WebP optimizada |
| `assets/img/profesionales-salud-mental.webp` | 123 KB | Versión WebP optimizada |

### Imágenes pendientes de optimización manual

> Estas imágenes pesan demasiado pero no se modificaron automáticamente para no romper HTML:

| Archivo | Tamaño | Nota |
|---------|--------|------|
| `logo-avion.png` | 336 KB | PNG con transparencia — considerar convertir a WebP |
| `logo-central-turnos.png` | 353 KB | PNG con transparencia — considerar convertir a WebP |
| `assets/dr-dagnino bis.png` | 4.8 MB | Archivo OLD/backup — eliminar si no se usa |
| `assets/dr-dagnino old.png` | 2.1 MB | Archivo OLD/backup — eliminar si no se usa |

---

## 4. Archivos modificados

### Archivos de configuración
- ✅ `netlify.toml` — Reescrito con cache por tipo de archivo + security headers
- ✅ `_redirects` — Agregado catch-all SPA + rewrites sin extensión
- ✅ `manifest.webmanifest` — `start_url` y `scope` a `"/"`, screenshots removidas, íconos faltantes creados
- ✅ `sw.js` — Cache versión bumpeada de `v2` → `v3`

### HTML modificado
- ✅ `index.html` — Hero image renombrada, `fetchpriority="high"` en hero, `<link>` a favicon/apple-touch-icon, cache busting `?v=2`

---

## 5. Checklist pre-deploy

```
✅ index.html existe en directorio publicado
✅ netlify.toml con publish = "." correcto
✅ netlify.toml con security headers
✅ _redirects con catch-all SPA
✅ manifest.webmanifest válido con start_url = "/"
✅ icon-192.png, icon-512.png, maskable, apple-touch-icon, favicon.ico
✅ Hero image sin espacio en nombre (dr-dagnino-backup.webp)
✅ Scripts JS existen en assets/js/ y cargan en orden correcto
✅ Cache busting actualizado a v=2
✅ Imágenes 2.5MB → WebP <125KB (reducción 95%)
✅ Fotos de equipo 7.4MB → 257KB (reducción 96%)
✅ Referencias faltantes en equipo.html creadas

⚠️ VERIFICAR EN NETLIFY DASHBOARD:
   Site Settings → Access control → Site protection → ¿está desactivada?
```

---

## 6. Instrucciones de deploy en Netlify

### Opción A — Drag & Drop (más simple)
1. Ir a [netlify.com](https://netlify.com) e iniciar sesión
2. En el panel del sitio, ir a **Deploys**
3. Arrastrar la carpeta `juegos_mensico` completa al área de deploy
4. Esperar que complete el deploy (~1-2 minutos)

### Opción B — Netlify CLI (recomendado para deploys frecuentes)
```bash
# Instalar CLI (una sola vez)
npm install -g netlify-cli

# En la carpeta del proyecto:
netlify login
netlify deploy --dir . --prod
```

### Opción C — GitHub + auto-deploy
1. Subir la carpeta a un repositorio GitHub
2. En Netlify: New site → Import from Git → seleccionar repo
3. Build settings: command vacío, publish directory = `.`

### Post-deploy — verificar
1. Abrir el sitio en modo incógnito (sin caché del browser)
2. Verificar que carga sin "Access Denied"
3. Verificar en DevTools → Application → Manifest que no hay errores
4. Verificar en DevTools → Application → Service Workers que está registrado
5. Verificar en DevTools → Console que no hay errores de 404

---

## 7. Notas sobre el SPA Router

`assets/js/spa.js` intercepta clics en links internos (`data-spa="1"` o links sin `data-spa="0"`) y usa `history.pushState` para navegación sin recarga.

**Compatibilidad con Netlify:**
- ✅ El catch-all en `_redirects` (`/* /index.html 200`) asegura que cualquier URL que el SPA pushee al historial devuelva `index.html` al refrescar la página
- ✅ Como todos los HTML files existen físicamente, Netlify los servirá directamente antes del catch-all (correcta precedencia)
- ✅ Links con `data-spa="0"` fuerzan recarga de página completa (para secciones complejas)

---

*Reporte generado automáticamente por Claude Code — 2026-02-21*
