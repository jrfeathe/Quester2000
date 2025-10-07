# Repository Guidelines

## Project Structure & Module Organization
- `src/` hosts the client (React + TypeScript). Key areas: `pages/` for route-level views, `components/` for reusable UI, `auth/` for session helpers, and `api/` for typed HTTP wrappers.
- `server/index.ts` is the Express API entry point; it wires Passport sessions and Prisma integrations.
- `prisma/` contains the schema and migrations that define `User` and `Quest` tables. Generated Prisma client code lives in `src/generated/prisma/`.
- Static assets live under `public/`, while Vite config and TypeScript project files sit at the repo root.

## Build, Test, and Development Commands
- `npm run dev`: launches Vite’s client dev server (frontend) and expects the Express server to be started separately with `npx tsx server/index.ts`.
- `npm run build`: type-checks with `tsc -b` and emits a production bundle.
- `npm run preview`: serves the built client bundle locally for smoke checks.
- `npm run lint`: runs ESLint across the monorepo; keep it clean before committing.
- Database workflows: `npx prisma migrate dev --name <name>` to evolve schema, `npx prisma generate` after migrations, `npx prisma studio` to inspect data.

## Coding Style & Naming Conventions
- TypeScript and TSX files use 2-space indentation and single quotes. Prefer functional React components with hooks.
- Keep module default exports for pages/components and named exports for helpers. Use PascalCase for components, camelCase for functions/variables, and SCREAMING_SNAKE_CASE for env vars.
- Run ESLint before PRs; the config (ESLint v9 + TypeScript plugin) enforces the agreed style.

## Testing Guidelines
- Vitest is configured but no suites exist. Create tests beside the code (`Component.test.tsx`, `route.test.ts`) using Vitest + Testing Library.
- Cover auth flows, Prisma data access, and quest list rendering at minimum. Aim for meaningful scenario coverage even if total % is not yet mandated.
- Run `npx vitest run` in CI mode; use `npx vitest --watch` during development.

## Commit & Pull Request Guidelines
- Follow the observed conventional-style prefixes (`Feat`, `Add`, `Upgrade`) with scoped descriptors, e.g., `Feat(Auth): Implement session handling`.
- Commits should be focused and lint/test clean. Mention Prisma migration files when schema changes.
- PRs need a clear summary, test evidence (`npm run lint`, `npx vitest`), linked issues, and UI/API screenshots or payload examples when relevant.
- Call out security-sensitive changes (auth routes, session config) so reviewers can prioritize them.

## Data & Environment Notes
- The app expects a PostgreSQL instance plus `.env` containing `DATABASE_URL` and `SESSION_SECRET`.
- New quest-related features should gate access via `requireAuth` middleware and return user-scoped data only.
