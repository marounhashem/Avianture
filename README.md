# Avianture

Private aviation operations platform — flight planning, crew coordination, and handler communication.

**Slice 1 scope:** Operator Admin + Flight Record + Handler Hub (structured acknowledgment).

---

## Demo accounts (seeded)

| Persona | Email | Password |
|---|---|---|
| Operator | marounhashem@gmail.com | Avianture2026! |
| Crew (Pilot) | pilot@avianture.demo | Avianture2026! |
| Handler (DXB) | handler.dxb@avianture.demo | Avianture2026! |
| Handler (LCLK) | handler.lclk@avianture.demo | Avianture2026! |

**Rotate `Avianture2026!` after first login in production.**

---

## Local development

```bash
git clone https://github.com/marounhashem/Avianture.git
cd Avianture
npm install
cp .env.example .env.local
# Fill DATABASE_URL with your Postgres URL (see options below)
# Fill NEXTAUTH_SECRET (generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

# Sync schema to your DB
npx prisma db push --accept-data-loss

# Seed demo data
npm run db:seed

# Start dev server
npm run dev
```

Open `http://localhost:3000` → sign in with any demo account.

### Getting a Postgres URL

Options:
- **Railway Postgres** (recommended): create a project, add Postgres plugin, copy the external `DATABASE_URL` into `.env.local`.
- **Neon** (free tier): neon.tech — create a project, copy the connection string.
- **Local install**: Postgres 16+ running on localhost:5432.

## Scripts

- `npm run dev` — Next.js dev server
- `npm run build` — production build (runs `prisma generate` + `prisma db push` + `next build`)
- `npm run start` — production server
- `npm run test` — Vitest unit tests
- `npm run db:push` — sync schema without migration history (MVP)
- `npm run db:seed` — reset and seed
- `npm run db:studio` — open Prisma Studio

## Deployment (Railway)

1. Create Railway project → add **Postgres** plugin → `DATABASE_URL` auto-injected.
2. Add a **web service** from this repo (`marounhashem/Avianture`).
3. Set env vars in the web service:
   - `NEXTAUTH_SECRET` — generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   - `NEXTAUTH_URL` — set to the Railway domain after first deploy (e.g., `https://avianture-production.up.railway.app`)
4. Railway auto-runs `npm run build` which syncs the schema.
5. **First deploy only:** run the seed once via Railway shell: `npm run db:seed`.

## Tech

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Prisma 7 · Postgres · Auth.js v5 (Credentials) · Zod · bcryptjs · Vitest

## Docs

- [Decisions log](./docs/DECISIONS.md) — running record of assumptions and trade-offs.
