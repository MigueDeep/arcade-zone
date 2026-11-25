# SPEC 02 — Home (landing) de Arcade Vault

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-11-25
> **Objective:** Portar la landing `home` del template `references/templates/home-about` a la ruta `/` de Next.js, mover la biblioteca a `/juegos` y agregar el enlace "Inicio" a la nav, con contenido estático mock tipado.

## Por qué existe este spec

El SPEC 01 dejó la biblioteca en `/` porque el template original solo tenía esa pantalla como entrada. El nuevo template (`home-about`) separa una landing (`home`) de la biblioteca. Para que `/` sea la landing hay que mover la biblioteca a otra URL y revisar todos los enlaces que hoy apuntan a `/` con el significado "ir a la biblioteca". Los estilos del home no existen en `app/globals.css` y hay que portarlos desde `styles.css` del template.

## Alcance

**Dentro:**

- Landing en `/` con las secciones del template, en este orden: hero (silhouettes flotantes, eyebrow, título de tres líneas, subtítulo, dos CTA, indicador "DESLIZA"), "¿POR QUÉ ARCADE VAULT?" (4 tarjetas con icono pixel), "JUEGOS DISPONIBLES AHORA" (6 mini-tarjetas), franja de estadísticas, "ACTIVIDAD EN VIVO" (últimas puntuaciones y top jugadores), "PRECIOS" (plan único y 3 preguntas frecuentes) y CTA final.
- Mover la biblioteca de `/` a `/juegos` (`app/juegos/page.tsx`) sin cambiar su comportamiento.
- Nav: enlaces `Inicio` (`/`), `Biblioteca` (`/juegos`) y `Salón de la Fama` (`/salon`), en la barra y en el panel móvil. El logo enlaza a `/`.
- Actualizar los enlaces existentes que significaban "volver a la biblioteca" para que apunten a `/juegos`: redirección tras login e invitado en `components/auth-form.tsx`, botón de `components/game-player.tsx`, botón de `components/hall-of-fame.tsx` y botón de `app/not-found.tsx`.
- Portar a `app/globals.css` los estilos del bloque `HOME PAGE`, `ACTIVITY` y `PRICING` de `styles.css` del template, más los `@keyframes` que aún no existan.
- Datos mock tipados en `lib/home-data.ts` (características, estadísticas, últimas puntuaciones, top jugadores, beneficios y preguntas frecuentes). Las mini-tarjetas usan `GAMES.slice(0, 6)` de SPEC 01.
- Todos los componentes de la landing son de servidor (sin estado ni efectos).

**Fuera de alcance (para specs futuros):**

- Página "Acerca de" (`about.jsx`) y su enlace en la nav. Va en su propio spec.
- Animación `reveal` al hacer scroll (`IntersectionObserver`). Las secciones se ven siempre; no se usa la clase `.reveal`.
- Datos reales o dinámicos en "ACTIVIDAD EN VIVO": no se leen `av_scores` ni `seededScores`, no hay actualización en vivo.
- CTA que cambien según la sesión (p. ej. ocultar "CREAR CUENTA" si hay usuario).
- Variantes de tema (`Theme variants`) y el gamepad del template.
- Contadores reales de juegos o partidas; los textos de la franja de estadísticas son los del template.
- Tests automatizados.

## Modelo de datos

```ts
// lib/home-data.ts
import type { GameColor } from "@/lib/games";

export type FeatureIconKind = "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET";

export interface Feature { icon: FeatureIconKind; title: string; desc: string; color: GameColor }
export interface HomeStat { n: string; unit: string; sub: string }
export interface RecentScore { player: string; game: string; score: number; ago: string; color: GameColor }
export interface TopPlayer { rank: number; player: string; score: number }
export interface FaqItem { q: string; a: string }

export const FEATURES: Feature[];            // 4 elementos
export const HOME_STATS: HomeStat[];         // 3 elementos
export const RECENT_SCORES: RecentScore[];   // 7 elementos
export const TOP_PLAYERS: TopPlayer[];       // 5 elementos
export const PRICING_PERKS: string[];        // 6 elementos
export const PRICING_FAQ: FaqItem[];         // 3 elementos
```

Convenciones:

- Los textos y valores son los del template `home.jsx`, sin cambios.
- Los nombres de jugador en `RECENT_SCORES` y `TOP_PLAYERS` son ficticios.
- Números con `toLocaleString("es-ES")`.
- Los iconos pixel y las silhouettes son SVG inline de `<rect>` copiados del template.

## Plan de implementación

Antes del paso 1: leer en `node_modules/next/dist/docs/01-app/` las guías de componentes de servidor/cliente, `Link` y las reglas de `cacheComponents` (ver CLAUDE.md y AGENTS.md). Para el diseño visual usar el skill `/frontend-design`, fiel al template.

Cada paso deja la app ejecutable. Al terminar cada uno, `npm run lint` pasa.

1. Crear `app/juegos/page.tsx` que renderiza `<Library />` (mismo contenido que hoy tiene `app/page.tsx`). Dejar `app/page.tsx` sin cambios por ahora. Verificación: `/juegos` muestra las 8 tarjetas y el filtro funciona.
2. Redirigir a `/juegos` los enlaces que significaban "biblioteca": `router.push("/")` en `components/auth-form.tsx` (login e invitado), el `Link` de `components/game-player.tsx`, el de `components/hall-of-fame.tsx` y el botón de `app/not-found.tsx`. Verificación: un login válido y "JUGAR COMO INVITADO" llevan a `/juegos`; "VOLVER AL VAULT" en el 404 lleva a `/juegos`.
3. Actualizar `components/nav.tsx`: agregar `Inicio` (`/`) en barra y panel móvil, apuntar `Biblioteca` a `/juegos`, logo a `/`. `Inicio` está activo solo si `pathname === "/"`; `Biblioteca` si el pathname empieza con `/juegos`. Verificación: en `/juegos/caida` solo `Biblioteca` aparece activo.
4. Portar los estilos del home a `app/globals.css`: bloques `HOME PAGE` (sin las reglas `.reveal`), `ACTIVITY` y `PRICING` de `styles.css`, y solo los `@keyframes` que falten (`bounce`, `float`, `pulse-led`, `tickin`, entre otros; no duplicar `pulse`, `blink`, `fadeIn`). Verificación: `npm run build` pasa y `/juegos` se ve igual que antes.
5. Crear `lib/home-data.ts` con los tipos y constantes del modelo de datos. Verificación: `npm run lint` pasa.
6. Crear `components/floating-silhouettes.tsx` (8 SVG decorativos con `aria-hidden`) y `components/feature-icon.tsx` (4 iconos pixel). Verificación: `npm run lint` pasa.
7. Crear `components/mini-game-card.tsx` (portada `cover-bg` + título + categoría, `Link` a `/juegos/{id}`). Verificación: `npm run lint` pasa.
8. Reemplazar `app/page.tsx` por la landing con la sección hero: silhouettes, eyebrow `▸ INSERTA UNA MONEDA_`, título, subtítulo, CTA `EXPLORAR JUEGOS` (→ `/juegos`) y `CREAR CUENTA` (→ `/acceso`), e indicador `DESLIZA`. Verificación: `/` muestra el hero y los dos botones navegan correctamente.
9. Agregar a `app/page.tsx` las secciones `// 01 ¿POR QUÉ ARCADE VAULT?` (4 tarjetas con `FeatureIcon`) y `// 02 JUEGOS DISPONIBLES AHORA` (6 mini-tarjetas y botón `VER TODOS LOS JUEGOS →` a `/juegos`). Verificación: se ven 4 tarjetas y 6 mini-tarjetas; hacer clic en una lleva a `/juegos/{id}`.
10. Agregar la franja de estadísticas y la sección `// 03 ACTIVIDAD EN VIVO` (ticker con 7 filas, top de 5 jugadores, enlace `VER SALÓN →` a `/salon`). Verificación: se ven 3 bloques de estadísticas, 7 filas de ticker y 5 filas de top con las 3 primeras destacadas.
11. Agregar la sección `// 04 PRECIOS` (tarjeta de plan único con 6 beneficios y botón `EMPEZAR GRATIS →` a `/acceso`; 3 preguntas frecuentes) y el CTA final `¿LISTO PARA JUGAR?` con `INSERTAR MONEDA →` a `/juegos`. Verificación: la página completa coincide con el template de arriba a abajo.

## Criterios de aceptación

- [ ] `npm run lint` termina sin errores.
- [ ] `npm run build` termina sin errores.
- [ ] `/` muestra el hero con el título `EL ARCADE CLÁSICO ESTÁ DE VUELTA` y las secciones `// 01`, `// 02`, `// 03` y `// 04` más el CTA final, en ese orden.
- [ ] `/juegos` muestra las 8 tarjetas de la biblioteca; escribir "caída" deja 1 y el chip `SHOOTER` deja 2.
- [ ] `EXPLORAR JUEGOS`, `VER TODOS LOS JUEGOS →` e `INSERTAR MONEDA →` navegan a `/juegos`.
- [ ] `CREAR CUENTA` y `EMPEZAR GRATIS →` navegan a `/acceso`.
- [ ] `VER SALÓN →` navega a `/salon`.
- [ ] La sección `// 02` muestra exactamente 6 mini-tarjetas y cada una navega a `/juegos/{id}` de su juego.
- [ ] La sección `// 01` muestra 4 tarjetas, cada una con su icono SVG; la sección `// 03` muestra 7 filas de puntuaciones y 5 de top jugadores.
- [ ] La nav muestra `Inicio`, `Biblioteca` y `Salón de la Fama` en la barra y en el panel móvil; no aparece `Acerca de`.
- [ ] En `/` solo `Inicio` está activo; en `/juegos` y `/juegos/caida` solo `Biblioteca`; en `/salon` solo `Salón de la Fama`.
- [ ] Hacer clic en el logo lleva a `/`.
- [ ] Un login válido en `/acceso` y `JUGAR COMO INVITADO` navegan a `/juegos`.
- [ ] `VOLVER AL VAULT` (404, reproductor y Salón) navega a `/juegos`.
- [ ] Ningún archivo de `app/` ni `components/` contiene la clase `reveal` ni usa `IntersectionObserver`.
- [ ] `app/page.tsx` y los componentes nuevos no tienen la directiva `"use client"`.
- [ ] A 375 px de ancho `/` no tiene scroll horizontal.
- [ ] No hay errores ni advertencias en la consola del navegador en `/`, `/juegos`, `/juegos/caida`, `/salon` y `/acceso`.

## Decisiones tomadas y descartadas

- **Sí:** landing en `/` y biblioteca en `/juegos`. Es la entrada natural del sitio y `/juegos` ya es el prefijo de `/juegos/[id]`.
- **No:** biblioteca en `/biblioteca` (nombre del template). Habría dos prefijos distintos para el mismo dominio de juegos.
- **No:** landing en una ruta nueva con `/` como biblioteca. La página de entrada no sería la landing.
- **Sí:** datos mock estáticos tipados en `lib/home-data.ts`, copiados del template. Coherente con SPEC 01 (todo mock) y sin backend.
- **No:** derivar el ticker y el top de `seededScores` o `av_scores`. Añade lógica cliente y riesgo de hidratación para una sección decorativa.
- **Sí:** solo Home en este spec; About aparte. El pedido fue "home page" y la nav no enlaza a una ruta que no existe.
- **Sí:** agregar `Inicio` a la nav, como en el template.
- **Sí:** portar los estilos del home a `globals.css`. Sin ellos la landing no se ve como el template.
- **No:** animación `reveal` con `IntersectionObserver`. No fue elegida; sin ella toda la landing es de servidor y no hay hook cliente.
- **Sí:** componentes de servidor para toda la landing. No hay estado ni efectos.
- **Sí:** el login y el modo invitado llevan a `/juegos`, no a `/`. Conserva el comportamiento de SPEC 01 (después de entrar, el usuario ve juegos).
- **Sí:** copiar los textos del template tal cual, incluido "12+ JUEGOS" aunque hoy haya 8. Es copy de marketing del diseño; se ajustará cuando crezca el catálogo.
- **Sí:** este spec reemplaza los criterios de SPEC 01 que decían que la biblioteca vive en `/` y que `VOLVER AL VAULT` lleva a `/`.

## Riesgos identificados

| Riesgo | Mitigación |
| ------ | ---------- |
| Quedan enlaces a `/` con el significado "biblioteca" que no se detectaron. | Buscar `href="/"` y `push("/")` en `app/` y `components/` en el paso 2 y revisar cada uno. |
| Los estilos portados chocan con los existentes (`@keyframes` duplicados, `.blink` limitado a `.av-hero`). | Portar solo `@keyframes` que falten y confirmar que `/juegos` no cambia visualmente en el paso 4. |
| `cacheComponents` y `partialPrefetching` exigen reglas para datos dinámicos. | La landing es 100 % estática (sin `params`, `cookies` ni `fetch`); confirmar con `npm run build`. |
| Las silhouettes absolutas generan scroll horizontal en móvil. | Mantener `overflow: hidden` del hero como en el template y verificar a 375 px. |

## Qué **no** está en este spec

- Página "Acerca de".
- Animación `reveal` al hacer scroll.
- Datos reales o en vivo en la actividad y el ranking del home.
- CTA dependientes de la sesión.
- Temas alternativos y gamepad.
- Tests automatizados.

Cada uno de estos puntos, si se aborda, va en su propio spec.
