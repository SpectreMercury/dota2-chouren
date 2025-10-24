# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages, layouts, and API routes (e.g., `src/app/api/players/route.ts`).
- `src/components`: Reusable React components (e.g., `PlayerCard.tsx`).
- `src/config`: Small config maps and constants (e.g., `players.ts`, `matches.ts`).
- `src/lib/prisma.ts`: Prisma client singleton for MongoDB.
- `prisma/schema.prisma`: Data model (MongoDB via `MONGODB_URI`).
- `scripts/migrate-data.ts`: JSON → MongoDB import; clears and seeds `players`.
- `data/players.json`: Seed data. Avoid editing in production workflows.
- `public/`: Static assets (hero images, backgrounds).

## Build, Test, and Development Commands
- `npm run dev`: Start Next.js in dev mode with hot reload.
- `npm run build`: Build the production bundle.
- `npm start`: Run the production server.
- `npm run lint`: Lint with Next.js ESLint config.
- `npx prisma generate`: Regenerate Prisma client after schema changes.
- `npx tsx scripts/migrate-data.ts`: Import `data/players.json` into MongoDB (destructive: calls `deleteMany`).

## Coding Style & Naming Conventions
- Indentation: 2 spaces; TypeScript across the app.
- React: Functional components, hooks first; server components where appropriate.
- Naming: `PascalCase` for components (`PlayerCard.tsx`), `camelCase` for vars/functions, `kebab-case` for route folders.
- Styling: Tailwind CSS in `globals.css` + utility classes; prefer semantic HTML and accessible attributes.
- Linting: Fix issues before PRs (`npm run lint`).

## Testing Guidelines
- No formal test suite yet. When adding tests, prefer Jest or Vitest for units and Playwright for e2e.
- Suggested naming: colocate as `Component.test.tsx` or use `__tests__/` mirroring `src/`.
- Keep functions pure where possible; mock network/Prisma in unit tests.

## Commit & Pull Request Guidelines
- Git history uses concise prefixes (e.g., `init:`, `update:`). Prefer conventional-style scopes: `feat(api): ...`, `fix(ui): ...`.
- PRs: include purpose, linked issues, screenshots for UI changes, and notes on data migrations.
- Checklist: passes lint, builds locally, no secrets committed, migration steps documented.

## Security & Configuration
- Environment: set `MONGODB_URI` locally and in deployment. Keep `.env` out of VCS.
- Data migration script is destructive; never run against production without backups.
- Validate external input to API routes and avoid leaking internal errors.

