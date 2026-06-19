# Auditoría mobile — FASE 0 (PLAN 3)

Fecha: 2026-06-19. Metodología: análisis estático de HTML/CSS (Tailwind, media queries, paddings, min-height) en 390–430px. No se probó en navegador en vivo (Claude in Chrome no disponible en esta sesión) ni se modificó ningún archivo.

Excluidos (no auditados, no tocar): Juego 12 (AeroCalma), Juego 18 (GeoFS).

## Juegos críticos (scroll significativo antes del botón/tablero)

- **Casino — Slots de la Ansiedad y Slots de Aeropuertos**: los 3 carretes pasan a 1 columna en mobile, cada uno con `min-height` fijo (190–230px) → ~600px solo de carretes antes del botón "Girar".
- **Juego 5 (Colores y atención) y Juego 6**: el hero apila título+botones de navegación (Volver a juegos/Inicio) en mobile, sumando una fila extra (~300–360px de hero) antes de la barra de estado y el estímulo.
- **Juego 22 (Cabina: diferencias)**: las dos imágenes SVG a comparar se apilan en mobile (eran 2 columnas) — tablero muy alto, pero es estructural al mecanismo del juego (necesita ambas imágenes visibles).
- **Casino — Ruleta de Aeropuertos**: tiene un paso adicional "Selector de destino" (grid de botones) antes del tablero de rueda/botón girar, más alto que su par de Salud Mental.

## Juegos moderadamente afectados

- **Casino — Ruleta del Estado de Ánimo**: en 1 columna mobile la rueda aparece antes del botón "Girar" (que vive en el panel lateral); queda al límite del fold, no enterrado.
- **Casino — Bingo de Impulsividad y Bingo Aeronáutico**: cartón de 16 celdas en 2 columnas (8 filas, ~650-700px), pero el orden es correcto (no hay paneles antes del juego); el botón "Reiniciar" está dentro del mismo bloque.
- **Juego 1, 2, 3, 4**: header sticky + hero corto (sin botones embebidos) — aceptable, pero la barra de chips + fila de botones de nivel/acción suma ~150–200px adicionales antes del tablero.
- **Juego 7 (Semáforo)**: sin hero navy; título+descripción+3 botones en una misma fila flex-wrap, seguido de 2 cajas de estado antes del semáforo.

## Juegos correctos

- **Juego 9, 10, 11, 15, 17**: plantilla de topbar compacto + game-shell; botón "Iniciar" en la misma fila que el título, área de estímulo visible sin scroll excesivo.
- **Juego 19, 20, 21, 23**: tarjetas minimalistas centradas (max-width 600–720px), título y subtítulo cortos, ya compactas.

## Causa principal del scroll (patrones transversales)

1. Hero con navegación duplicada (Volver a juegos + Inicio) embebida en el mismo bloque flex que el título, que se apila debajo en mobile.
2. Tableros con altura fija por colapso de columnas: carretes de slots, cartones de bingo, paneles de imagen comparativa — cada celda/carril tiene `min-height` que no se reduce lo suficiente en mobile.
3. En layouts de 2 columnas que colapsan a 1 en mobile, cuando el elemento grande (rueda, imagen) precede en el HTML al panel con el botón de acción, el botón queda después del elemento grande.
4. Bloques de chips de estado + filas de 3 botones de acción que se apilan en 2 filas por `flex-wrap`, sumando ~50–100px antes del tablero.

## Orden de reparación propuesto (dentro de las fases ya definidas)

- FASE 2 (Atención): Juego 5 y 6 primero (críticos) → Juego 1/2/3/4 (ajuste menor) → Juego 7 y 22 (caso por caso, 22 limitado por su mecánica).
- FASE 3 (Memoria): ya en buen estado en general — ajustes menores, sin prioridad alta.
- FASE 4 (Lenguaje/razonamiento): ya en buen estado en general — ajustes menores.
- FASE 5 (Casino Salud Mental): Slots de la Ansiedad (crítico) → Ruleta del Estado de Ánimo (moderado) → Bingo de Impulsividad (moderado).
- FASE 6 (Casino Aeronáutico): Slots de Aeropuertos y Ruleta de Aeropuertos (críticos) → Bingo Aeronáutico (moderado).

## Nota fuera de la lista explícita

Juego 8, 13, 14 y 16 no figuran en la lista explícita del plan ni en las exclusiones. No fueron auditados en esta fase. Dado que ya recibieron rediseño dedicado en un plan anterior, probablemente ya cumplen los criterios — pero quedan pendientes de una decisión sobre si se incluyen en el alcance de PLAN 3.
