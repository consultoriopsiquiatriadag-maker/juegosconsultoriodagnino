# Auditoría mobile — Temas de Salud Mental (FASE 3)

**Fecha:** 2026-06-21
**Alcance:** revisión diagnóstica de los 13 temas ya desarrollados. No se modificó ningún archivo de tema en esta fase.
**Método:** análisis estático de estructura HTML/CSS de cada página (no se contó con dispositivo o navegador real para renderizar; el análisis se basa en breakpoints declarados, anchos mínimos de elementos, longitud de párrafos y patrones conocidos de mobile-first).

## Tabla de hallazgos

| Archivo | Lectura mobile | Problema principal | Prioridad |
|---|---|---|---|
| `estres-postraumatico.html` | Aceptable | "Explicación larga" con varios párrafos corridos y sin TOC; usa `.note` genérico en vez de `.topic-safety-note` | Media |
| `adicciones.html` | Aceptable | Ejercicio con varios campos de texto + textarea alarga el formulario en pantalla angosta | Media |
| `insomnio-cbt-i-plan-7-dias.html` | Pesada por volumen | Es la página más extensa del sitio (plan de 7 días + diario + mitos + comorbilidades); mucho scroll e inputs aunque cuenta con TOC | Media-Alta |
| `fobia-al-vuelo.html` | Aceptable | Etiquetas de slider con `min-width:220px`, las más anchas del sitio; en 390px fuerza salto de línea (aunque el contenedor ya tiene `flex-wrap:wrap`, así que no rompe el layout) | Baja |
| `narcolepsia.html` | Buena | Única página sin `<style>` propio (ya usa solo `app.css`); la tabla Epworth con selects puede quedar apretada en 390px aunque tiene scroll contenido | Baja |
| `estres-cronico-burnout.html` | Buena | Bien organizada con TOC y grillas; usa `.note` genérico en la sección de alarma en vez de una variante de mayor contraste | Baja |
| `factores-humanos-aviacion-vida.html` | Aceptable | 8 zócalos + TOC; mucho contenido total y scroll largo, aunque bien fragmentado en tarjetas cortas | Media |
| `saturacion-audiovisual.html` | Pesada por volumen | La página con más sub-grillas (síntomas en 4, riesgos en 6, autoevaluación en 3 bloques); usa emojis en `.badge` (⚡🔁🧩🌙), contrario al tono institucional pedido | Media |
| `sindrome-capgras.html` | Aceptable con punto a mejorar | Sin TOC/acceso rápido; "Explicación larga" con 7 párrafos corridos, la más extensa del bloque de síndromes; usa `.note` genérico | Media |
| `sindrome-cotard.html` | Aceptable con punto a mejorar | Mismo patrón que Capgras (sin TOC, 7 párrafos corridos); contenido clínicamente sensible (rechazo a alimentarse) señalizado solo con `.note` genérico, sin contraste de riesgo | Media-Alta |
| `sindrome-diogenes.html` | Pesada por volumen | La más larga del bloque de síndromes (8 zócalos incluyendo "Mitos y realidad"), sin TOC, explicación larga de 7 párrafos | Media |
| `crisis-suicida-autolesiones-plan-seguridad.html` | Muy completa, la mejor estructurada | Página extensísima del sitio, pero con TOC, alerta de urgencia destacada (`.alert-urgente`) y checklist accionable; el camino hasta "Qué hacer hoy" sigue requiriendo bastante scroll para un momento de crisis | Alta (por la criticidad del tema, no por mal diseño) |
| `sindrome-fregoli.html` | Riesgo de scroll horizontal | Tabla comparativa Capgras vs. Fregoli (3 columnas) sin contenedor `overflow:auto`; en pantallas de 390px puede comprimirse o desbordar horizontalmente. Sin TOC, explicación larga de 6 párrafos | Alta |

## Hallazgos transversales

**Ninguna de las 13 páginas usa la plantilla compartida `assets/css/topics.css`.** Todas duplican su propio bloque `<style>` con clases equivalentes (`.topic-hero`, `.exercise-grid`, `.range-row`, etc.), repitiendo CSS que ya existe centralizado. Esto confirma que la homogeneización (fase de plantilla) es necesaria y sustancial: ninguna página se beneficia hoy del archivo compartido.

**Ninguna página usa la clase `.topic-safety-note` / `.topic-safety-note--risk`** definida en la plantilla para avisos de seguridad con mayor contraste en temas de riesgo. En su lugar usan `.note` genérico (mismo estilo que una nota informativa cualquiera). La única excepción real es `crisis-suicida-autolesiones-plan-seguridad.html`, que construyó su propio banner de alta visibilidad (`.alert-urgente`), pero con una clase ad-hoc, no la del sistema compartido. `sindrome-cotard.html` es el caso más notorio de bajo contraste para un tema con riesgo vital (rechazo a alimentarse).

**Dos plantillas distintas convivieron en el desarrollo:** un grupo con TOC/"Acceso rápido", audio y video (`estres-postraumatico`, `adicciones`, `insomnio-cbt-i`, `fobia-al-vuelo`, `estres-cronico-burnout`, `factores-humanos-aviacion-vida`, `saturacion-audiovisual`, `crisis-suicida...`), y un grupo más simple sin TOC ni audio/video (`narcolepsia`, `sindrome-capgras`, `sindrome-cotard`, `sindrome-diogenes`, `sindrome-fregoli`). El segundo grupo, al no tener accesos rápidos, obliga a más scroll para llegar a secciones tardías como "Cómo acompañar" o "Señales de alarma".

**Bug concreto de mobile:** la tabla comparativa en `sindrome-fregoli.html` (`.compare-table`, 3 columnas) no tiene contenedor con `overflow-x:auto`. Es el único caso detectado de posible scroll horizontal o compresión de contenido en pantallas angostas — contradice el principio "nada de scroll horizontal" de la plantilla compartida.

**Emojis en contenido:** `saturacion-audiovisual.html` usa emojis dentro de badges de contenido (⚡🔁🧩🌙), y varias páginas usan un emoji como logo de cabecera (🧠, ✈︎, 💙). Esto entra en conflicto con el tono institucional sin emojis acordado para el sitio.

**Etiquetas de slider anchas:** varias páginas (`fobia-al-vuelo`, `sindrome-capgras`, `sindrome-cotard`, `sindrome-diogenes`, `sindrome-fregoli`, `saturacion-audiovisual`, `estres-cronico-burnout`, `factores-humanos-aviacion-vida`) usan `.range-row label { min-width: 210–220px }`. En pantallas de 390px esto fuerza el salto de línea del slider (mitigado por `flex-wrap:wrap`, no rompe el layout pero lo hace menos prolijo).

**Scripts muertos:** `estres-cronico-burnout.html`, `factores-humanos-aviacion-vida.html`, `crisis-suicida-autolesiones-plan-seguridad.html`, y los 4 archivos de síndromes (`capgras`, `cotard`, `diogenes`, `fregoli`) referencian `js/i18n.js`, `js/audio.js`, `js/spa.js` (sin prefijo `assets/`). No es un problema de mobile en sí, pero conviene revisarlo en limpieza de código.

## Orden sugerido de atención (no se ejecuta en esta fase)

1. Corregir el riesgo de scroll horizontal en la tabla de `sindrome-fregoli.html`.
2. Reforzar el contraste del aviso de seguridad en `sindrome-cotard.html` (y, en general, migrar los avisos de riesgo a una variante de alto contraste).
3. Adoptar `assets/css/topics.css` en las 13 páginas para eliminar la duplicación de CSS (base de la fase de homogeneización).
4. Agregar TOC/acceso rápido a las 5 páginas que no lo tienen (`narcolepsia`, los 4 síndromes).
5. Quitar emojis de contenido y de logos de cabecera.
6. Revisar volumen de scroll en las páginas más densas (`insomnio-cbt-i-plan-7-dias`, `saturacion-audiovisual`, `sindrome-diogenes`).

Esta es una auditoría diagnóstica; ningún archivo de tema fue modificado en esta fase.
