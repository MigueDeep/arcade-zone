# SPEC 03 — Página "Acerca de" y formulario de contacto con Resend

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-11-26
> **Objective:** Portar la pantalla `about.jsx` del template `references/templates/home-about` a la ruta `/acerca` de Next.js y hacer que su formulario de contacto envíe un correo real con Resend mediante una Server Action.

## Por qué existe este spec

SPEC 02 dejó fuera la página "Acerca de" y su enlace en la nav. En el template, el formulario de contacto solo simula el envío (`setSent(...)`). Aquí el envío pasa a ser real, lo que introduce una dependencia externa (`resend`), secretos en variables de entorno y estados de error que el template no tiene.

## Alcance

**Dentro:**

- Ruta `/acerca` (`app/acerca/page.tsx`) con las secciones del template, en este orden: hero "ACERCA DE ARCADE VAULT" (kicker, título, misión, 3 destacados con icono pixel), divisor con 24 píxeles animados y sección "CONTÁCTANOS" (intro con 3 tips y formulario).
- Formulario de contacto con campos `NOMBRE`, `CORREO ELECTRÓNICO` y `MENSAJE`, botón `▶  ENVIAR MENSAJE` y animación `shake` si faltan campos.
- Pantalla de éxito estilo terminal (`VAULT-OS // TERMINAL`) con el texto del template, y botón `ENVIAR OTRO MENSAJE` que limpia el formulario.
- Estado de error: si el envío falla, se conservan los datos escritos y se muestra un mensaje de error con el botón de envío habilitado de nuevo. El éxito de terminal solo aparece cuando Resend confirma el envío.
- Envío con Server Action (`app/acerca/actions.ts`) y el SDK `resend`. Validación en el servidor y campo trampa (honeypot) como protección anti-abuso.
- Configuración por variables de entorno: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. Se agrega `.env.example` sin valores reales.
- Nav: enlace `Acerca de` (`/acerca`) en la barra y en el panel móvil, activo solo si el pathname empieza con `/acerca`.
- Portar a `app/globals.css` el bloque `ABOUT PAGE` de `styles.css` del template, incluido `@keyframes shake` si aún no existe (sin las reglas `.reveal`).
- Todo `/acerca` es de servidor salvo el formulario (`components/contact-form.tsx`), que es el único componente cliente.

**Fuera de alcance (para specs futuros):**

- Animación `reveal` al hacer scroll (`IntersectionObserver`), igual que en SPEC 02. Las secciones se ven siempre.
- Correo de confirmación automático al visitante.
- Límite de envíos por IP (rate limit) ni CAPTCHA.
- Guardar los mensajes en base de datos o mostrarlos en alguna pantalla.
- Plantillas HTML de correo: el correo se envía en texto plano.
- Dominio propio verificado en Resend; el remitente por defecto es `onboarding@resend.dev`.
- Cambios al footer, a los temas alternativos y al gamepad del template.
- Tests automatizados.

## Modelo de datos

```ts
// lib/contact.ts
export interface ContactInput {
  name: string;   // 1–60 caracteres tras trim
  email: string;  // formato de correo, máx. 120 caracteres
  msg: string;    // 1–2000 caracteres tras trim
}

export type ContactFieldErrors = Partial<Record<keyof ContactInput, string>>;

export type ContactResult =
  | { ok: true; name: string }
  | { ok: false; error: "validation"; fields: ContactFieldErrors }
  | { ok: false; error: "send" };

export function validateContact(raw: Record<string, unknown>): { ok: true; data: ContactInput } | { ok: false; fields: ContactFieldErrors };
```

Variables de entorno (solo servidor, nunca `NEXT_PUBLIC_`):

```bash
# .env.example
RESEND_API_KEY=
CONTACT_TO_EMAIL=          # correo de la cuenta de Resend mientras no haya dominio verificado
CONTACT_FROM_EMAIL=onboarding@resend.dev
```

Convenciones:

- El honeypot es un input `website`, oculto con CSS y fuera del orden de tabulación (`tabIndex={-1}`, `autoComplete="off"`).
- Si `website` llega con valor, la acción responde `{ ok: true }` sin enviar correo (el bot no recibe pista).
- Correo: `from` = `CONTACT_FROM_EMAIL`, `to` = `CONTACT_TO_EMAIL`, `replyTo` = correo del visitante, asunto `[Arcade Vault] Mensaje de {name}` (sin saltos de línea), cuerpo en `text` con nombre, correo y mensaje.
- Los textos y copy son los del template `about.jsx`, sin cambios.

## Plan de implementación

Antes del paso 1: leer en `node_modules/next/dist/docs/01-app/` las guías de Server Actions / formularios, componentes de servidor y cliente, y las reglas de `cacheComponents` (ver CLAUDE.md y AGENTS.md). Para el diseño visual usar el skill `/frontend-design`, fiel al template.

Cada paso deja la app ejecutable. Al terminar cada uno, `npm run lint` pasa.

1. Instalar `resend` (`npm install resend`) y crear `.env.example`. Confirmar que `.env*` está en `.gitignore`. Verificación: `npm run build` pasa.
2. Portar el bloque `ABOUT PAGE` de `styles.css` a `app/globals.css` (sin `.reveal`; `@keyframes shake` solo si falta). Verificación: `npm run build` pasa y `/juegos` se ve igual que antes.
3. Crear `lib/contact.ts` con los tipos y `validateContact`. Verificación: `npm run lint` pasa.
4. Crear `components/highlight-icon.tsx` (iconos pixel `HEART`, `BROWSER`, `PLANT`, copiados del template). Verificación: `npm run lint` pasa.
5. Crear `app/acerca/page.tsx` de servidor con el hero, los destacados y el divisor, y `metadata` con título "Acerca de · Arcade Vault". Verificación: `/acerca` muestra título, misión, 3 destacados y el divisor.
6. Agregar `Acerca de` a `components/nav.tsx` (barra y panel móvil) con su estado activo. Verificación: en `/acerca` solo `Acerca de` está activo.
7. Crear `components/contact-form.tsx` (`"use client"`) con la sección `CONTÁCTANOS` completa: campos, `shake` al faltar datos, pantalla de éxito de terminal y `ENVIAR OTRO MENSAJE`; el envío aún es simulado como en el template. Montarlo en `app/acerca/page.tsx`. Verificación: enviar vacío hace `shake`; enviar completo muestra la terminal con `GRACIAS, {NOMBRE}.`.
8. Crear `app/acerca/actions.ts` (`"use server"`): valida con `validateContact`, aplica el honeypot, envía con Resend y devuelve `ContactResult`. Verificación: `npm run lint` pasa.
9. Conectar `ContactForm` a la acción con `useActionState`: botón deshabilitado y texto `ENVIANDO…` mientras envía, éxito de terminal con `ok: true`, mensaje de error con `ok: false` conservando los datos escritos. Verificación manual con `.env.local` válido: llega el correo al destinatario con `Reply-To` del visitante; con `RESEND_API_KEY` inválida se ve el error y no la terminal.

## Criterios de aceptación

- [ ] `npm run lint` termina sin errores.
- [ ] `npm run build` termina sin errores.
- [ ] `/acerca` muestra, en este orden, el hero `ACERCA DE ARCADE VAULT`, 3 destacados, el divisor y la sección `CONTÁCTANOS`.
- [ ] La nav muestra `Acerca de` en la barra y en el panel móvil; en `/acerca` solo ese enlace está activo y en `/`, `/juegos` y `/salon` no lo está.
- [ ] Enviar el formulario con algún campo vacío no llama a Resend y aplica la clase `shake`.
- [ ] Enviar nombre, correo válido y mensaje llega un correo a `CONTACT_TO_EMAIL` con `Reply-To` igual al correo escrito, asunto `[Arcade Vault] Mensaje de {nombre}` y el mensaje en el cuerpo.
- [ ] Tras el envío exitoso se muestra la terminal con `MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, {NOMBRE EN MAYÚSCULAS}.`.
- [ ] `ENVIAR OTRO MENSAJE` vuelve al formulario con los tres campos vacíos.
- [ ] Con `RESEND_API_KEY` inválida se muestra un mensaje de error, no la terminal, y los campos conservan lo escrito.
- [ ] Mientras se envía, el botón está deshabilitado y muestra `ENVIANDO…`.
- [ ] Un correo sin formato válido, un nombre de más de 60 caracteres o un mensaje de más de 2000 son rechazados por el servidor aunque se evite la validación del navegador.
- [ ] Si el campo `website` llega con valor, la acción responde éxito y no se envía ningún correo.
- [ ] `RESEND_API_KEY`, `CONTACT_TO_EMAIL` y `CONTACT_FROM_EMAIL` no aparecen en el JavaScript del cliente ni en el repositorio; `.env.example` existe sin valores secretos.
- [ ] Ningún archivo de `app/` ni `components/` contiene la clase `reveal` ni usa `IntersectionObserver`.
- [ ] Solo `components/contact-form.tsx` (y los componentes cliente ya existentes) tienen `"use client"`; `app/acerca/page.tsx` no.
- [ ] A 375 px de ancho `/acerca` no tiene scroll horizontal y el formulario ocupa una columna.
- [ ] No hay errores ni advertencias en la consola del navegador en `/acerca`, `/`, `/juegos` y `/salon`.

## Decisiones tomadas y descartadas

- **Sí:** Server Action. Menos código que un endpoint, valida en el servidor y la clave de Resend nunca llega al cliente.
- **No:** Route Handler `POST /api/contacto`. Solo tendría sentido con otro consumidor del endpoint, que hoy no existe.
- **Sí:** remitente `onboarding@resend.dev` y destinatario por variable de entorno. Resend solo permite ese remitente hacia el correo de la cuenta hasta verificar un dominio; cambiar de dominio después es solo cambiar variables.
- **Sí:** `replyTo` con el correo del visitante, para responder directo desde el buzón.
- **Sí:** validación en servidor más honeypot. Es el mínimo razonable para un endpoint público sin infraestructura nueva.
- **No:** rate limit por IP. En memoria no es fiable en entornos serverless y con Upstash/Redis agrega infraestructura nueva; se abordará en otro spec si hay abuso.
- **Sí:** respuesta de éxito falsa al honeypot. El bot no aprende que fue detectado.
- **Sí:** correo en texto plano. Evita inyección de HTML con contenido del visitante y no necesita plantillas.
- **Sí:** estado de error visible y datos conservados. El template no lo tenía porque no enviaba nada; sin él un fallo de Resend dejaría al usuario sin respuesta.
- **Sí:** ruta `/acerca` con el nombre en español. Coherente con `/juegos`, `/salon` y `/acceso`.
- **No:** animación `reveal`. Coherente con SPEC 02: así `/acerca` es de servidor salvo el formulario.
- **No:** correo de confirmación al visitante. Duplica el uso de cuota y requiere dominio verificado; no fue elegido.
- **Sí:** mantener la validación de campos vacíos en el cliente (con `shake`) como en el template y repetirla en el servidor, que es la que cuenta.
- **Sí:** los tres criterios sin marcar en la última pregunta (error con estilo terminal, sin `reveal`, sin correo de confirmación) se resolvieron con los valores recomendados porque el spec los necesita para ser ejecutable; se pueden cambiar al revisarlo.

## Riesgos identificados

| Riesgo | Mitigación |
| ------ | ---------- |
| Resend rechaza `onboarding@resend.dev` hacia un destinatario distinto al correo de la cuenta. | Documentarlo en `.env.example`; `CONTACT_TO_EMAIL` debe ser el correo de la cuenta hasta verificar un dominio. |
| Falta alguna variable de entorno en el despliegue. | La acción devuelve `{ ok: false, error: "send" }` sin filtrar detalles y registra el motivo en el log del servidor. |
| Spam o abuso agota la cuota gratuita de Resend. | Honeypot y validación; si ocurre, un spec nuevo añade rate limit o CAPTCHA. |
| Inyección de cabeceras vía nombre en el asunto. | Quitar saltos de línea del nombre antes de armar el asunto. |
| La Server Action choca con `cacheComponents`/`partialPrefetching`. | La página es estática; la acción solo corre al enviar. Confirmar con `npm run build`. |
| Los estilos portados chocan con los existentes (`.field`, `input`). | Los selectores del template están acotados a `.contact-form`; revisar `/acceso` en el paso 2. |

## Qué **no** está en este spec

- Animación `reveal` al hacer scroll.
- Correo de confirmación al visitante.
- Rate limit, CAPTCHA o almacenamiento de mensajes.
- Plantillas HTML de correo y dominio propio verificado.
- Temas alternativos, gamepad y cambios al footer.
- Tests automatizados.

Cada uno de estos puntos, si se aborda, va en su propio spec.
