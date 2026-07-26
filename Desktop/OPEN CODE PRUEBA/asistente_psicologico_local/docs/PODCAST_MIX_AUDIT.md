# Auditoría: Mezcla accidental del módulo podcast en el repositorio

**Fecha:** 26 de julio de 2026  
**Auditor:** opencode  
**Proyecto auditado:** `asistente_psicologico_local`  
**Git repo raíz:** `C:\Users\LABORATORIO` (home del usuario)  
**Remote:** `https://github.com/consultoriopsiquiatriadag-maker/juegosconsultoriodagnino.git`

---

## 1. Resumen del Hallazgo

Se detectó que el repositorio git se inicializó en `C:\Users\LABORATORIO` (home del usuario) en lugar de dentro del directorio del proyecto `asistente_psicologico_local`. Como consecuencia:

1. El repositorio git **no trackea ningún archivo** del proyecto "Asistente Psicológico Virtual Local".
2. El repositorio trackea únicamente 3 archivos del proyecto "PAGINA PRINCIPAL SEBASTIAN NUÑEZ" (dashboard/podcast) ubicado en `Desktop/PAGINA PRINCIPAL SEBASTIAN NUÑEZ/`.
3. El proyecto "Asistente Psicológico Virtual Local" funciona de forma completamente independiente (sin git), con sus 77 tests pasando.
4. La rama actual `feature/dashboard-inicial` tiene el upstream eliminado.

**No se encontró ningún archivo del podcast dentro del directorio `asistente_psicologico_local/`.** La mezcla ocurrió a nivel del repositorio git del home, no a nivel del proyecto en sí.

---

## 2. Inventario de Archivos Originales (Asistente Psicológico Virtual Local)

### Raíz del proyecto (`asistente_psicologico_local/`)

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `config.json` | Configuración de la app | Original |
| `config.example.json` | Ejemplo de configuración | Original |
| `pytest.ini` | Configuración de pytest | Original |
| `requirements.txt` | Dependencias Python | Original |
| `README.md` | Documentación del proyecto | Original |
| `MANIFIESTO.md` | Manifiesto de migración (creado recientemente) | Original |
| `instalar.bat` | Script de instalación | Original |
| `iniciar.bat` | Script de inicio | Original |

### `app/` — Backend principal

| Ruta | Propósito | Estado |
|------|-----------|--------|
| `app/main.py` | Punto de entrada FastAPI | Original |
| `app/api/auth.py` | Autenticación PBKDF2 | Original |
| `app/api/sessions.py` | CRUD sesiones | Original |
| `app/api/messages.py` | CRUD mensajes | Original |
| `app/api/rules.py` | CRUD reglas | Original |
| `app/api/profiles.py` | CRUD perfiles | Original |
| `app/api/training.py` | CRUD entrenamiento | Original |
| `app/api/simulation.py` | CRUD simulación | Original |
| `app/api/safety.py` | CRUD seguridad | Original |
| `app/api/summary.py` | CRUD resúmenes | Original |
| `app/api/resources.py` | Recursos del consultorio (creado recientemente) | Original |
| `app/api/export.py` | Exportación profesional (creado recientemente) | Original |
| `app/api/voice.py` | Voz TTS | Original |
| `app/api/config.py` | Config API | Original |
| `app/core/config.py` | Gestión de configuración | Original |
| `app/core/security.py` | PBKDF2 + tokens | Original |
| `app/database/connection.py` | SQLite connection pool | Original |
| `app/database/schema.py` | Esquema de 9 tablas | Original |
| `app/exports/export_service.py` | Exportación JSON/TXT/HTML (creado recientemente) | Original |
| `app/llm/provider.py` | Interfaz LLM | Original |
| `app/llm/mock_provider.py` | MockLLMProvider | Original |
| `app/models/*.py` | Modelos Pydantic (9 archivos) | Original |
| `app/resources/web_resources.py` | Datos sitio web (creado recientemente) | Original |
| `app/rules/engine.py` | Motor de reglas | Original |
| `app/rules/parser.py` | Parseo de reglas | Original |
| `app/rules/conflict.py` | Detección de conflictos | Original |
| `app/safety/*` | Módulo de seguridad | Original |
| `app/services/*.py` | Servicios de negocio (11 archivos) | Original |
| `app/static/css/main.css` | Estilos (dark/light) | Original |
| `app/static/js/main.js` | Lógica frontend | Original |
| `app/templates/base.html` | Template base Jinja2 | Original |
| `app/templates/chat.html` | Template chat | Original |
| `app/templates/login.html` | Template login + sidebar | Original |

### `tests/` — Tests

| Archivo | Tests | Estado |
|---------|-------|--------|
| `tests/test_export.py` | 1 | Original |
| `tests/test_export_full.py` | 11 | Creado recientemente |
| `tests/test_messages.py` | 3 | Original |
| `tests/test_profiles.py` | 9 | Original |
| `tests/test_rules.py` | 1 | Original |
| `tests/test_rules_full.py` | 11 | Original |
| `tests/test_safety.py` | 11 | Original |
| `tests/test_sessions.py` | 4 | Original |
| `tests/test_simulation.py` | 10 | Original |
| `tests/test_summary.py` | 7 | Original |
| `tests/test_training.py` | 9 | Original |

### `data/`, `venv/`, `logs/`

| Ruta | Propósito | Estado |
|------|-----------|--------|
| `data/` | Base de datos SQLite (runtime) | Original |
| `venv/` | Entorno virtual Python | Original |
| `logs/` | Logs de la aplicación | Original |

**Total archivos originales: ~60+ archivos fuente (sin contar venv ni __pycache__)**

---

## 3. Inventario de Archivos del Podcast / Dashboard

### `Desktop/PAGINA PRINCIPAL SEBASTIAN NUÑEZ/`

| Archivo | Tamaño | Propósito |
|---------|--------|-----------|
| `index.html` | ~286 líneas | Dashboard Sebastián Núñez (cinematic digital instrument) |
| `script.js` | ~858 líneas | Lógica del dashboard (GSAP, widgets, telemetry) |
| `style.css` | ~1,286 líneas | Estilos Moss/Clay/Cream palette |
| `PAGINA PRINCIPAL SEBASTIAN NUÑEZ.zip` | — | Backup comprimido del mismo proyecto |

### `Desktop/PAGINA PRINCIPAL SEBASTIAN NUÑEZ/js/` (untracked)

| Archivo | Propósito |
|---------|-----------|
| `sportswear-hub.html` | Página de sportswear (posiblemente relacionada) |

**Total archivos del podcast: 3 archivos committeados + extras sin trackear**

---

## 4. Archivos Potencialmente Sobrescritos

**No se detectaron archivos sobrescritos.**

Los archivos del podcast (`index.html`, `script.js`, `style.css`) fueron creados dentro de `Desktop/PAGINA PRINCIPAL SEBASTIAN NUÑEZ/`, un directorio completamente ajeno al proyecto `asistente_psicologico_local`. No existe colisión de nombres ni de rutas.

---

## 5. Archivos Duplicados

**No se detectaron archivos duplicados.**

El proyecto original y el podcast no comparten ningún nombre de archivo ni ruta.

---

## 6. Archivos Ambiguos

| Archivo | Ruta | Descripción | Decisión |
|---------|------|-------------|----------|
| `exports/tts_3f1f0fe3dbe746f0b0e3829f9900683c.wav` | Raíz del proyecto | Archivo WAV generado por el TTS del asistente durante una ejecución. No es parte del código fuente. | Mover a `_recovery/podcast_mixed/` si se confirma que no pertenece al proyecto |

**Nota:** El directorio `docs/` en raíz del proyecto está vacío. El directorio `backups/` también está vacío.

---

## 7. Análisis del Repositorio Git

### Configuración actual

| Propiedad | Valor |
|-----------|-------|
| Git root | `C:\Users\LABORATORIO` |
| Remote | `origin → https://github.com/consultoriopsiquiatriadag-maker/juegosconsultoriodagnino.git` |
| Rama actual | `feature/dashboard-inicial` |
| Upstream | Eliminado (git branch --unset-upstream needed) |
| Archivos trackeados | 3 (`Desktop/PAGINA PRINCIPAL SEBASTIAN NUÑEZ/index.html`, `script.js`, `style.css`) |
| Último commit | `5751e3a` — "feat: add Sebastián Núñez dashboard — cinematic digital instrument" |
| Commits totales en el repo | ~200+ (historial completo del sitio Sala de Espera Virtual) |

### Ramas existentes

```
  claude/admiring-taussig-d02e37
  claude/awesome-gates
  claude/blissful-hodgkin-90f92c
  claude/dreamy-varahamihira
  claude/elastic-herschel
  claude/focused-bhaskara
  claude/funny-goldwasser-5b0d98
  claude/hopeful-mendel
  claude/lucid-meitner
  claude/nifty-bouman
  claude/pedantic-liskov-55afb9
  claude/sad-shaw-60b677
  claude/youthful-jang-7d2070
* feature/dashboard-inicial
  main
  master
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
```

**Conclusión:** Este repositorio git corresponde al sitio web **juegosconsultoriodagnino.netlify.app** (Sala de Espera Virtual). El commit del podcast se hizo accidentalmente en esta rama.

---

## 8. Estado del Proyecto Asistente Psicológico Virtual Local

### Tests ejecutados

```
pytest tests/ -v
77 passed, 9 warnings in 2.95s
```

**Todos los tests pasan correctamente.** No hay afectación en el funcionamiento del asistente.

### Servidor

```
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
✓ Server OK
```

### Dependencias

Instaladas en `venv/` (entorno virtual local). Sin conflictos.

---

## 9. Propuesta de Movimientos para la Separación

### Objetivo

Dejar el proyecto `asistente_psicologico_local` como un repositorio git independiente, y separar el código del podcast a su propio módulo interno reutilizando la infraestructura existente.

### Plan propuesto

#### Paso 1: Inicializar git en el proyecto
```bash
cd asistente_psicologico_local
git init
git add .
git commit -m "feat: init Asistente Psicológico Virtual Local (8 fases, 77 tests)"
```

#### Paso 2: Crear módulo podcast dentro del proyecto
```
app/podcast/
├── __init__.py
├── models.py          # Modelos Pydantic para episodios
├── service.py         # Lógica de generación y gestión de podcasts
├── api.py             # Endpoints REST (/api/podcast/*)
└── templates/         # Jinja2 para páginas de podcast
```

El módulo reutilizará:
- FastAPI (misma app, mismo lifespan)
- SQLite (nuevas tablas `podcast_episodes`, `podcast_audio`)
- Autenticación (mismo middleware, mismas cookies)
- MockLLMProvider (para generar guiones/texto)
- Exportación (para descargar episodios)
- Sistema de voz TTS (para narración)

#### Paso 3: Archivos a mover a `_recovery/podcast_mixed/`

| Archivo | Razón |
|---------|-------|
| `exports/tts_3f1f0fe3dbe746f0b0e3829f9900683c.wav` | Runtime artifact no perteneciente al código fuente |

#### Paso 4: Configurar `.gitignore` adecuado
```
venv/
data/
__pycache__/
*.pyc
.env
*.wav
logs/
exports/*.wav
```

---

## 10. Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Perder el commit del podcast al separar repos | Media | Alto | Hacer backup del repo home antes de cualquier operación |
| Romper los 77 tests al agregar módulo podcast | Baja | Medio | Ejecutar tests después de cada cambio |
| Confundir el remote del repo home con el proyecto | Alta | Medio | Inicializar repo nuevo dentro del proyecto ASAP |
| Sobrescribir `config.json` del proyecto | Baja | Alto | Nunca sobrescribir archivos existentes |
| Que el TTS WAV no sea del podcast sino del asistente | Media | Bajo | Verificar contenido del WAV antes de mover |
| La rama `feature/dashboard-inicial` sin upstream | Alta | Bajo | No afecta, se puede eliminar después del backup |

---

## 11. Acciones Recomendadas (Orden de Ejecución)

1. ✅ **Auditar** — COMPLETADO (este documento)
2. **Backup** del repo home completo
3. **Inicializar git** en `asistente_psicologico_local/`
4. **Crear** `_recovery/podcast_mixed/` y mover archivos ambiguos
5. **Migrar** el código del dashboard/podcast a `app/podcast/`
6. **Configurar** `.gitignore` del nuevo repo
7. **Commit inicial** del proyecto limpio
8. **Ejecutar** los 77 tests para verificar integridad
9. **Push** a nuevo remote (o mantener local)
10. **Eliminar** el commit accidental del repo home (opcional)

---

## 12. Anexo: Diferencias Clave

| Aspecto | Asistente Psicológico Virtual Local | Podcast Sebastián Núñez |
|---------|-------------------------------------|------------------------|
| Tipo | Aplicación web Python/FastAPI | Sitio estático HTML/CSS/JS |
| Backend | FastAPI + SQLite | Ninguno (Netlify-ready) |
| Frontend | Jinja2 + Vanilla JS | Vanilla HTML/CSS/JS + GSAP CDN |
| Tests | 77 tests pytest | Sin tests |
| Dependencias | 15+ paquetes Python | 0 (solo GSAP CDN) |
| Estado | Activo, 8 fases completadas | Commit único, no integrado |
| Git | No trackeado | Trackeado en repo home |

---

*Documento generado por opencode el 26 de julio de 2026.*  
*Propósito: Auditoría para separación segura del módulo podcast.*
