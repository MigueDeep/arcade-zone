# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault (package name `arcade-zone`): an online platform to play games and compete for the highest score. Currently a fresh Create Next App scaffold (`app/layout.tsx`, `app/page.tsx`, `app/globals.css`) with no game logic yet. The README says development follows spec-driven design (`/spec` and `/spec-impl` skills, installed via `npx skills@latest add Klerith/fernando-skills`).

## Commands

- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)

No test runner is configured.

## Next.js version warning

Next.js 16.4.6 with React 19.3 and App Router (`app/`). This version has breaking changes from older Next.js. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/01-app/` (see AGENTS.md).

`next.config.ts` enables non-default features that affect how code must be written:
- `cacheComponents: true` and `partialPrefetching: true` — Cache Components / PPR model; check the docs for the rules on dynamic data and caching.
- `experimental.agentFeedback: true`.
- Tailwind v4 is wired through Turbopack: a `*.css` rule uses `@tailwindcss/turbopack`. Styling is configured in CSS (`@import "tailwindcss"` and `@theme inline` in `app/globals.css`), not in a `tailwind.config` file.

TypeScript is strict.
