# Decisions Log — Avianture Slice 1

## Overview

Running log of design/implementation decisions and assumptions for Slice 1.

## 2026-04-24 — Initial build

### Auth: email + password (not magic link)
**Context:** No email service available in MVP.
**Decision:** Auth.js Credentials provider + bcryptjs.
**Trade-off:** Higher friction than magic link; demo passwords exposed in README.
**Revisit when:** Email service added → switch to magic link.

### Realtime: polling over websockets
**Decision:** Flight Detail page reloads every 5 seconds when tab visible (inline script).
**Trade-off:** Bandwidth/cost vs. implementation complexity.
**Revisit when:** Multiple concurrent operators cause UX issues or sub-second updates are needed.

### DB provisioning: `prisma db push` instead of migrations
**Decision:** Use `prisma db push --accept-data-loss` in build script rather than `prisma migrate deploy`.
**Rationale:** Faster for MVP — no migration history to manage. Schema is the source of truth.
**Revisit when:** Production traffic or multiple environments need controlled migrations.

### Prisma 7: `datasource.url` moved to `prisma.config.ts`
**Observation:** In Prisma 7, the schema's datasource block can no longer contain `url = env("DATABASE_URL")`. Env wiring happens in `prisma.config.ts`, which already loads `dotenv/config`.

### Multi-tenancy: operator-scoped workspaces
**Decision:** All operator data scoped by `operatorId`. Handlers are per-operator in Slice 1.
**Risk:** A handler with the same email invited by two operators will see a "This email is already linked to another handler" error. Intentional until Slice 2 resolves cross-operator handler identity.

### ICAO codes: free text, no validation
**Decision:** 4-character uppercase strings. No airport DB lookup.
**Revisit when:** Dispatchers report typos.

### Service transitions: strict forward-only state machine
`PENDING → ACKNOWLEDGED → IN_PROGRESS → COMPLETED` — no regressions.
**Revisit when:** Handlers need to "revert" (e.g., fuel arrived but got rejected).

### React 19 `<form action={...}>` type incompatibility
**Context:** Our server actions return `{ error: string | null }`. React 19 tightens the `action` prop to `(fd: FormData) => void | Promise<void>`.
**Workaround:** Inline cast `as unknown as (fd: FormData) => void` at the JSX usage site. Actions still execute and return their payload server-side.
**Revisit when:** We want to surface `{ error }` in the UI via `useActionState` — then the cast goes away.

### Demo password: `Avianture2026!`
**Security:** This appears in README and seed data. Rotate immediately for production. Also: the Railway token used during build attempts (`a700ec86-...`) appeared in chat history — it must be rotated.
