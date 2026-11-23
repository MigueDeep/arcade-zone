# SPEC 01 — Pantallas visuales del MVP de Arcade Vault

> **Status:** Aprovado
> **Depends on:** Ninguno
> **Date:** 2026-11-23
> **Objective:** Portar a Next.js (App Router) las cinco pantallas del template `references/templates` (biblioteca, detalle, reproductor simulado, salón de la fama y acceso) con datos mock tipados y sesión simulada en localStorage, sin juegos reales.

## Por qué existe este spec

El proyecto es un scaffold de Create Next App con los estilos del template ya portados a `app/globals.css` y las fuentes cargadas en `app/layout.tsx`, pero sin ninguna pantalla. El template de referencia es un prototipo React con router casero (hash) y datos globales en `window`. Este spec lo convierte en código Next.js idiomático para que los specs siguientes (juegos reales, auth real, base de datos) tengan dónde enchufarse.

## Alcance

**Dentro:**

- Cinco pantallas con rutas reales del App Router: `/` (biblioteca), `/juegos/[id]` (detalle), `/juegos/[id]/jugar` (reproductor), `/salon` (salón de la fama) y `/acceso` (iniciar sesión / crear cuenta).
- Layout global con `Nav` (enlaces, contador de créditos, botón de sesión, panel móvil con hamburguesa) y footer, igual que el template.
- Datos mock tipados: los 8 juegos de `data.jsx` y el generador de puntuaciones con semilla (`seededScores`).
- Sesión simulada: usuario `{ name }` guardado en localStorage (`av_user`), con modo invitado.
- Validación mínima de los formularios de `/acceso` con errores en línea.
- Reproductor simulado: HUD, pausa, marco CRT, arena decorativa, puntaje que sube solo, modal de fin de juego y guardado de la puntuación en localStorage (`av_scores`).
- Conexión de las puntuaciones guardadas: "Tu mejor marca" del Salón y "Tu mejor" en el detalle leen `av_scores`, con estado vacío si no hay ninguna.
- Página 404 con estética arcade (`app/not-found.tsx`) para ids de juego inexistentes.
- Reemplazo del `app/page.tsx` del scaffold.

**Fuera de alcance (para specs futuros):**

- Juegos jugables reales (lógica, canvas, controles). El reproductor solo simula.
- Autenticación real (Auth.js, Supabase, etc.), OAuth con Google/GitHub (los botones son decorativos) y verificación de credenciales.
- Base de datos o backend para juegos y puntuaciones; ranking global real.
- Cambiar los estilos de `app/globals.css` más allá de ajustes puntuales necesarios para que las pantallas se vean como el template.
- Internacionalización (todo el texto queda en español).
- Créditos funcionales: el contador `CRÉDITOS · 03` es un valor fijo.
- Tests automatizados (no hay test runner configurado).

## Modelo de datos

```ts
// lib/games.ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;          // slug de la URL, p. ej. "bloque-buster"
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string;       // clase CSS existente en globals.css, p. ej. "cover-bricks"
  color: GameColor;
  best: number;        // mejor puntuación global (mock)
  plays: string;       // p. ej. "12.4K"
}

export const GAMES: Game[];                              // los 8 juegos del template
export const CATS: ("TODOS" | GameCategory)[];

// lib/scores.ts
export interface ScoreRow { rank: number; name: string; score: number; date: string } // date: "DD/MM/2026"
export function seededScores(seed: number, count?: number): ScoreRow[];

// lib/saved-scores.ts
export interface SavedScore { game: string; score: number; name: string; at: number } // at = Date.now()
// clave localStorage: "av_scores" -> SavedScore[]

// components/session-provider.tsx
export interface SessionUser { name: string }            // máx. 10 caracteres, mayúsculas
// clave localStorage: "av_user" -> SessionUser | null
```

Convenciones:

- Semillas idénticas al template: detalle `id.length * 17 + 3` con 10 filas; salón `id.length * 23 + 7` con 12 filas.
- Números con `toLocaleString("es-ES")`.
- Las claves `av_user` y `av_scores` se mantienen tal cual el template, sin prefijo de versión.
- Todo acceso a localStorage va en `try/catch` y solo en componentes cliente.

## Plan de implementación

Antes del paso 1: leer en `node_modules/next/dist/docs/01-app/` las guías de rutas dinámicas (`params`), `generateStaticParams`, `not-found`, componentes cliente/servidor y las reglas de `cacheComponents` (ver CLAUDE.md y AGENTS.md). Para el diseño visual usar el skill `/frontend-design` fiel al template.

Las rutas que aún no existen en un paso intermedio caen en el 404 por defecto de Next; la app sigue ejecutable.

1. Crear `lib/games.ts` con los tipos, `GAMES` y `CATS` copiados de `data.jsx`. Verificación: `npm run lint` pasa.
2. Crear `lib/scores.ts` con `seededScores` tipado, idéntico al template. Verificación: `npm run lint` pasa.
3. Crear `lib/saved-scores.ts` con `saveScore(entry)` y `getBestScore(gameId, name)`, tolerantes a localStorage no disponible. Verificación: `npm run lint` pasa.
4. Crear `components/session-provider.tsx` (cliente): contexto con `user`, `ready`, `login(user | null)` y `logout()`, leyendo `av_user` tras montar para evitar errores de hidratación. Envolver `children` en `app/layout.tsx`. Verificación: la app arranca sin errores.
5. Crear `components/nav.tsx` (cliente) y `components/footer.tsx`, y montarlos en `app/layout.tsx` junto a `<main className="av-main">`. Incluye enlaces a `/` y `/salon`, estado activo por `usePathname`, panel móvil y botón de sesión (`Iniciar Sesión` → `/acceso`; con usuario, `{name} ▾` cierra sesión). Verificación: la nav y el footer se ven en `/` y el panel móvil abre y cierra a 375 px.
6. Crear `components/game-card.tsx` (con efecto tilt) y `components/library.tsx` (hero, búsqueda, chips de categoría, grilla, estado "NO HAY RESULTADOS"); reemplazar `app/page.tsx` por la biblioteca. Verificación: se ven 8 tarjetas, filtrar por texto y categoría funciona.
7. Crear `app/not-found.tsx` con estética arcade y botón "VOLVER AL VAULT". Verificación: `/ruta-inexistente` muestra la pantalla.
8. Crear `app/juegos/[id]/page.tsx` (servidor, `notFound()` si el id no existe, `generateStaticParams` con `GAMES`) y `components/leaderboard.tsx`; incluir "Tu mejor" en un componente cliente pequeño. Verificación: `/juegos/caida` muestra portada, stats, ranking de 10 filas y botones; `/juegos/xyz` muestra el 404.
9. Crear `app/acceso/page.tsx` y `components/auth-form.tsx` (cliente): pestañas, validación mínima, botón invitado, botones sociales decorativos; al éxito llama `login` y navega a `/`. Verificación: un login válido muestra el nombre en la nav; los campos inválidos muestran errores.
10. Crear `app/juegos/[id]/jugar/page.tsx` y `components/game-player.tsx` (cliente): HUD, pausa, CRT, arena, puntaje simulado, modal de fin, guardado con `saveScore`. Verificación: tras guardar, el modal muestra "PUNTUACIÓN GUARDADA_" y `av_scores` contiene la entrada.
11. Crear `app/salon/page.tsx` y `components/hall-of-fame.tsx` (cliente): pestañas por juego, podio, tabla con animación escalonada, fila "TU MEJOR MARCA" con datos reales de `av_scores` o estado vacío. Verificación: cambiar de juego cambia el podio y la tabla; la marca guardada en el paso 10 aparece.

## Criterios de aceptación

- [ ] `npm run lint` termina sin errores.
- [ ] `npm run build` termina sin errores.
- [ ] `/` muestra 8 tarjetas; escribir "caída" deja 1; el chip `SHOOTER` deja 2; una búsqueda sin coincidencias muestra "NO HAY RESULTADOS".
- [ ] Hacer clic en una tarjeta o en `JUGAR` navega a `/juegos/{id}`.
- [ ] `/juegos/caida` muestra título, categoría, descripción, `Partidas`, `Mejor global` y 10 filas de ranking con las 3 primeras en oro, plata y bronce.
- [ ] `/juegos/xyz` y `/juegos/xyz/jugar` muestran `not-found` con botón de volver; no hay error 500.
- [ ] `JUGAR AHORA` lleva a `/juegos/{id}/jugar` y `VOLVER AL VAULT` a `/`.
- [ ] En `/juegos/{id}/jugar` el puntaje sube solo; `PAUSA` lo detiene y muestra "EN PAUSA"; `REANUDAR` lo reanuda.
- [ ] `FIN` abre el modal con la puntuación final; `GUARDAR PUNTUACIÓN` guarda una entrada `{ game, score, name, at }` en `av_scores` y muestra "PUNTUACIÓN GUARDADA_".
- [ ] `JUGAR DE NUEVO` reinicia puntaje, nivel y vidas; `SALIR` vuelve al detalle del juego.
- [ ] En `/acceso`, enviar con usuario vacío o menor a 3 caracteres, o contraseña vacía, muestra error en línea y no inicia sesión.
- [ ] En la pestaña "Crear cuenta", un correo vacío o sin formato válido muestra error; en "Iniciar sesión" el campo de correo no aparece.
- [ ] Un envío válido guarda `av_user` con el nombre en mayúsculas (máx. 10 caracteres), navega a `/` y la nav muestra ese nombre.
- [ ] `JUGAR COMO INVITADO` navega a `/` sin guardar `av_user`.
- [ ] Recargar la página conserva la sesión; hacer clic en `{name} ▾` la cierra y la nav vuelve a mostrar `Iniciar Sesión`.
- [ ] Los botones de Google y GitHub no hacen nada ni producen errores en consola.
- [ ] `/salon` muestra las pestañas de los 8 juegos, el podio con 3 posiciones y 12 filas; cambiar de pestaña cambia los datos.
- [ ] En `/salon` con sesión iniciada y una puntuación guardada de ese juego, "TU MEJOR MARCA" muestra el valor guardado; sin puntuaciones muestra un mensaje de estado vacío; sin sesión no aparece la sección.
- [ ] En `/juegos/{id}` con sesión iniciada y una puntuación guardada, se muestra "Tu mejor" con ese valor.
- [ ] A 375 px de ancho no hay scroll horizontal, los enlaces de la nav se ocultan y el panel de hamburguesa funciona.
- [ ] No hay errores ni advertencias de hidratación en la consola del navegador en ninguna de las cinco rutas.

## Decisiones tomadas y descartadas

- **Sí:** rutas reales del App Router (`/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/salon`, `/acceso`). URLs compartibles y aprovecha el modelo de Next.js 16.
- **No:** una sola página con router por hash como el template. No aprovecha Next y no da URLs reales.
- **Sí:** sesión mock en localStorage (`av_user`) con invitado. Es lo mínimo para mostrar las variantes de las pantallas.
- **No:** auth real con proveedor. Es un dominio grande y merece su propio spec.
- **Sí:** datos mock tipados en TypeScript (`lib/games.ts`, `lib/scores.ts`). Mismo comportamiento que el template, con tipos estrictos.
- **No:** base de datos real. Se hará cuando existan juegos reales que generen puntuaciones.
- **Sí:** reproductor con la simulación del template. Permite probar el flujo de fin de juego y guardado sin tener juegos.
- **No:** marco CRT vacío. No permitiría probar el guardado de puntuaciones.
- **Sí:** conectar `av_scores` a "Tu mejor marca" (Salón) y "Tu mejor" (detalle). El ranking global sigue siendo mock con semilla.
- **No:** dejar las puntuaciones sin leer como en el template. Daría una función de guardado sin efecto visible.
- **Sí:** validación mínima en `/acceso` (usuario 3-10 caracteres, contraseña obligatoria, correo con formato solo en "Crear cuenta"). Sin verificar credenciales.
- **No:** replicar el fallback a `PLAYER1` del template. Ocultaba formularios vacíos.
- **Sí:** `notFound()` con `app/not-found.tsx` arcade para ids inexistentes.
- **No:** redirigir a la biblioteca. Esconde el error y confunde al usuario.
- **Sí:** el filtro de la biblioteca y la pestaña del Salón viven en estado cliente, como en el template. Evita depender de `searchParams` bajo `cacheComponents`.
- **Sí:** mantener `av_user` y `av_scores` sin prefijo de versión. Son datos mock y las claves coinciden con el template.
- **Sí:** el nivel del reproductor se calcula a partir del puntaje (`floor(score / 2500) + 1`) y las vidas son fijas en 3. El template subía de nivel de forma errática y es una simulación.
- **Sí:** "MEJOR PUNTUACIÓN" de las tarjetas y "Mejor global" del detalle siguen usando `Game.best` (mock global). La marca personal se muestra aparte.

## Riesgos identificados

| Riesgo | Mitigación |
| ------ | ---------- |
| `cacheComponents` y `partialPrefetching` exigen reglas específicas para datos dinámicos y `params`. | Leer las guías en `node_modules/next/dist/docs/01-app/` antes del paso 1; usar `generateStaticParams` en `/juegos/[id]` y confirmar con `npm run build`. |
| Leer localStorage en el render provoca errores de hidratación. | `SessionProvider` lee `av_user` tras montar (`ready`) y la nav muestra un estado neutro hasta entonces. Mismo criterio para `av_scores`. |
| localStorage deshabilitado o con JSON corrupto. | Todo acceso en `try/catch`; la app funciona sin persistencia. |
| Los estilos del template usan `#root` y clases globales que pueden chocar con el layout de Next. | `layout.tsx` ya mantiene `<div id="root">`; la nav y el footer se montan dentro y `main` usa `.av-main`. |
| El `setInterval` del reproductor sigue activo al salir de la página. | Limpiar el intervalo en el `return` del `useEffect`, como en el template. |

## Qué **no** está en este spec

- Juegos jugables reales.
- Autenticación real u OAuth.
- Base de datos o ranking global real.
- Créditos funcionales.
- Internacionalización.
- Tests automatizados.

Cada uno de estos puntos, si se aborda, va en su propio spec.
