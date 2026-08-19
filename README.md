# NeerPlan

Open-source rooftop rainwater harvesting assessment platform for Indian households.

Features include a transparent rooftop-potential calculation, account registration, saved assessments, printable reports, compliance-readiness guidance, and protected homeowner/installer workflows.

## Development

```bash
pnpm dev
```

1. Copy `.env.example` to `.env.local` and set a unique `NEXTAUTH_SECRET` before deploying.
2. Install dependencies with `pnpm install`.
3. Initialize the local database with `pnpm db:push`.
4. Start the app with `pnpm dev`.

## PostgreSQL deployment preparation

SQLite remains the local default. Prisma fixes the database provider in each schema, so production uses `prisma/postgresql/schema.prisma` and its versioned migrations. Set `DATABASE_URL` to a PostgreSQL connection string, then run this once from a trusted machine or CI job that can reach the database:

```bash
pnpm db:postgres:generate
pnpm db:postgres:migrate-deploy
pnpm build
```

Use a managed or self-hosted PostgreSQL instance with backups, TLS, and restricted credentials for production. Do not run both schemas against the same database URL. `db:postgres:push` remains available only for disposable development databases; never use it for the production migration.

## Vercel deployment preparation

The committed `vercel.json` sets the Vercel build command to `pnpm build:vercel`, which generates Prisma Client from the PostgreSQL schema before running Next.js. In Vercel Project Settings, set these variables:

| Variable | Production | Preview | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Required | Separate preview database recommended | Pooled PostgreSQL URL for the running app; do not expose it with a `NEXT_PUBLIC_` prefix. |
| `DIRECT_URL` | Required | Required if Preview uses PostgreSQL | Direct PostgreSQL URL, used only by Prisma migration commands. |
| `NEXTAUTH_SECRET` | Required | Required | Long unique random secret; mark it Sensitive. |
| `NEXTAUTH_URL` | Required | Optional | Canonical production URL, for example `https://app.example.com`; set it only for the matching domain. |
| `NEXT_PUBLIC_APP_NAME` | Optional | Optional | Public display name only. |

Set `ENABLE_EXPERIMENTAL_COREPACK=1` if Vercel does not automatically honor the pinned pnpm version. Do not add a migration command to the Vercel build step: run `pnpm db:postgres:migrate-deploy` before the first deployment and for every future schema migration.

## Installer operations

Users are homeowners by default. Designate trusted accounts as `INSTALLER` or `ADMIN` in Prisma Studio (`pnpm db:studio`) or your database administration process. Administrators assign a survey request through `PATCH /api/admin/leads/:id/assign` with an installer ID; installers then manage the request status in `/installer`.

The compliance checklist is practical readiness guidance only. It is not a permit, engineering sign-off, or legal approval.

Run the local quality checks with:

```bash
pnpm lint
pnpm build
```

`lint` currently runs the strict TypeScript check. The installed ESLint/TypeScript versions are not mutually compatible, so it is intentionally not invoked until those developer dependencies are upgraded together.

The application uses Next.js, TypeScript, Tailwind CSS, Prisma, SQLite/PostgreSQL, and NextAuth — all free and open-source tools.

## Location-based rainfall estimates

The assessment can retrieve a city-based annual rainfall estimate for India from the [Open-Meteo Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api). It averages daily precipitation for the ten most recently completed calendar years, shows the source and retrieval date, and records those details in a saved assessment report. A value typed into the rainfall field is always a manual user override. If the lookup cannot match a city or the service is unavailable, the existing manual value remains unchanged.

Open-Meteo's free API is suitable for this initial non-commercial use and requires attribution under its published terms. Review its [terms of service](https://open-meteo.com/en/terms) before commercial use or a high-volume rollout.
