# FASE 0 — Auditoría de juegos cognitivos legados

Fecha: 2026-06-18
Alcance: 17 juegos listados en el plan maestro de homogeneización (grupos Atención y control, Memoria y aprendizaje, Lenguaje y razonamiento). No incluye Juego 8, 13, 16 (ya rediseñados) ni Juego 14/18 (fuera de este plan).

## 1. Tres generaciones técnicas detectadas

Los 17 archivos no son homogéneos entre sí: corresponden a tres "generaciones" de construcción distintas, lo cual condiciona cómo conviene intervenir cada uno.

**Generación A — Tailwind CDN + paleta inline `inst-*`** (la más antigua; cada archivo repite su propio `tailwind.config` con `inst-navy/inst-blue/inst-sky/inst-light/inst-gray`, sin vínculo a `assets/css/app.css`):
Juego 1, 2, 3, 4, 5, 6, 7.

**Generación B — ya vinculada a `assets/css/app.css`** (más cerca del sistema institucional actual):
Juego 9, 10, 11, 15, 17.

**Generación C — CSS propio con variables `:root` (`--bg/--dark/--blue/--muted`), sin Tailwind y sin `app.css`** (la más reciente de las tres, visualmente más prolija pero aislada del resto del sitio):
Juego 19, 20, 21, 22, 23.

Ningún juego de este lote usa todavía `assets/css/gamification.css` ni `assets/css/casino.css` (los únicos que los usan son 8, 13 y 16, ya intervenidos).

## 2. Tabla de estado por juego

| # | Juego (plan) | Archivo | Categoría | Generación | `app.css` | Puntaje/score | Racha | Nivel | Medalla | localStorage | `@media` | aria-label | Emojis | Nav. "Volver a juegos" |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Atención sostenida | juego1.html | Atención | A | No | No | No | No | No | Sí | 1 | 1 | Sí | No detectado |
| 3 | Memoria de trabajo y foco | juego3.html | Atención | A | No | No | No | No | No | No | 1 | 8 | Sí | No detectado |
| 5 | Colores y atención | juego5.html | Atención | A | No | Sí | Sí | No | No | No | 1 | 2 | Sí | Sí |
| 6 | Búsqueda visual | juego6.html | Atención | A | No | No | Sí | No | No | No | 1 | 8 | Sí | Sí |
| 7 | Semáforo (Go/No-Go) | juego7.html | Atención | A | No | Sí | Sí | No | No | No | 1 | 7 | Sí | No detectado |
| 22 | Cabina: diferencias | juego22-cabina-diferencias.html | Atención | C | No | No | No | Sí | No | No | 1 | 5 | Sí | Sí |
| 2 | Velocidad de procesamiento | juego2.html | Memoria | A | No | No | No | No | No | Sí | 0 | 5 | Sí | No detectado |
| 4 | Memory aeronáutico | juego4.html | Memoria | A | No | No | No | No | No | Sí | 1 | 6 | Sí | No detectado |
| 11 | Dígitos | juego11-digitos.html | Memoria | B | Sí | No | Sí | Sí | No | Sí | 1 | 9 | Sí | No detectado |
| 19 | Respiración y memoria | juego19-respiracion-secuencia.html | Memoria | C | No | Sí | No | No | No | No | 0 | 20 | Sí | Sí |
| 20 | Historia de vuelo | juego20-historia-de-vuelo.html | Memoria | C | No | Sí | No | No | No | No | 0 | 10 | Sí | Sí |
| 21 | Pasajeros | juego21-pasajeros.html | Memoria | C | No | Sí | No | No | No | No | 2 | 12 | Sí | Sí |
| 9 | Categorías semánticas | juego9-categorias-semanticas.html | Lenguaje | B | Sí | No | Sí | Sí | No | Sí | 2 | 7 | Sí | No detectado |
| 10 | Refranes | juego10-refranes.html | Lenguaje | B | Sí | Sí | Sí | No | No | Sí | 2 | 8 | Sí | No detectado |
| 15 | Palabras / pseudopalabras | juego15-palabras-pseudopalabras.html | Lenguaje | B | Sí | No | Sí | Sí | No | Sí | 1 | 6 | Sí | No detectado |
| 23 | Palabras inversas | juego23-palabras-inversas.html | Lenguaje | C | No | Sí | No | No | No | No | 0 | 7 | Sí | Sí |
| 17 | Secuencias lógicas | juego17-secuencias-logicas.html | Lenguaje | B | Sí | No | No | Sí | No | Sí | 2 | 13 | Sí | No detectado |

Notas sobre la tabla:
- "No detectado" en la última columna no significa necesariamente que falte la navegación, sino que el patrón de texto exacto buscado no apareció (puede usar otro texto o un ícono); se confirma al abrir cada archivo antes de tocarlo.
- "Puntaje/score" e similares se relevaron por palabra clave; algunos juegos pueden mostrar el concepto con otra palabra (p. ej. "aciertos", "resultado") y eso se revisa al entrar a cada fase puntual.

## 3. Hallazgos relevantes para las fases siguientes

1. **Emojis en el 100% de los juegos.** Los 17 archivos contienen emojis en algún punto (títulos, botones o feedback). La regla del plan es "sin emojis", así que cada fase de grupo (4, 5, 6) deberá incluir su reemplazo por iconografía sobria o texto.
2. **Ninguno tiene medalla de cierre.** El concepto de medalla/resultado final (bronce-plata-oro-comandante, ya definido en `gamification.css`) no existe en ningún juego de este lote — es 100% trabajo nuevo de FASE 2.
3. **Racha y nivel están parcialmente presentes pero no estandarizados.** 7 juegos mencionan "racha" y 7 mencionan "nivel", pero con implementaciones propias y no con el motor común (`window.GP`) ya construido para los juegos aeronáuticos. Reutilizarlo (en vez de crear una cuarta variante) es el camino más eficiente.
4. **Tres arquitecturas distintas conviven.** La Generación A (Tailwind CDN inline) es la que requiere más trabajo de unificación porque no comparte ni paleta ni componentes con el resto del sitio. La Generación C es la más nueva y prolija, pero tampoco está conectada al sistema institucional. Conviene que el "game-shell" de FASE 1 funcione por encima de las tres (clases nuevas + variables propias, sin depender de que el archivo use o no Tailwind).
5. **Accesibilidad despareja.** Juego 1, 2 y 3 tienen muy pocos `aria-label` (1, 5 y 8 respectivamente, sobre todo heredados de componentes genéricos) y son los más débiles del lote en ese sentido.
6. **Posible desalineación de nombres.** El título interno de Juego 1 es "Mnésico" y el de Juego 2 es "Categorías" — no coinciden literalmente con las etiquetas del plan ("Atención sostenida" y "Velocidad de procesamiento"). El contenido del juego sí corresponde a la mecánica esperada por su número de archivo; es solo el `<title>` interno el que está desactualizado y conviene corregirlo de paso cuando se intervenga cada uno.

## 4. Componentes candidatos a unificar (insumo para FASE 1)

- Header/topbar del juego (existen 3 variantes: header Tailwind con `inst-*`, header con `app.css`, topbar con variables propias).
- Tarjeta/panel principal de juego (`.card`, `.section-card`, paneles con sombra — nombres distintos, mismo propósito).
- Barra de estado/progreso (chips de ronda, aciertos, racha).
- Botones de acción (iniciar, reiniciar, volver a juegos) — tamaños y estilos distintos entre generaciones.
- Pantalla de cierre con resultado.

Esto confirma que el `game-shell` de FASE 1 puede construirse como una capa de clases nuevas (en línea con `gamification.css`) que se agregue encima de cualquiera de las tres generaciones, sin reescribir la lógica interna de cada juego.

## 5. Propuesta de orden de intervención

1. **Pilotos (FASE 3):** Juego 1 (Generación A, simple) y Juego 4 (Generación A, ya correctamente nombrado, mecánica de memoria con tarjetas — buen caso para validar el `game-shell` en un juego de tipo "board/grid"). Antes de tocar Juego 1, conviene revisar y corregir su `<title>` interno.
2. **Grupo Atención (FASE 4):** sugerido empezar por Juego 5 y 7 (ya tienen algo de puntaje/racha, menor esfuerzo) antes que Juego 3 y 6 (sin ningún concepto de progreso todavía) y Juego 22 (Generación C, requiere puente distinto).
3. **Grupo Memoria (FASE 5):** Juego 11 (Generación B, ya con `app.css`, racha y nivel) puede ir primero como referencia; luego 2 y 4; por último 19, 20 y 21 (Generación C, sin `@media`, hay que revisar mobile con más cuidado).
4. **Grupo Lenguaje (FASE 6):** Juego 9, 10, 15 y 17 (Generación B) son el bloque más parejo y rápido; Juego 23 (Generación C) queda al final del grupo.

## 6. Commit de esta fase

```bash
git add docs/auditoria-fase0-juegos-legados.md
git commit -m "docs: audit legacy cognitive games for visual and gamification redesign"
git push
```

---
Fase completada. Espero autorización para continuar con la siguiente.
