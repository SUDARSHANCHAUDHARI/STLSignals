# STL Signals

AI-assisted engineering trend discovery and content drafting platform. Monitors public Reddit discussions as signal input, clusters trends by topic, generates original research packets and blog drafts for human editorial review.

**Safety guarantees:** No auto-posting, no copying full Reddit posts, no publishing without manual approval.

## Stack

- Next.js 15 App Router (TypeScript strict)
- Tailwind CSS + shadcn-style component primitives
- Prisma + Supabase Postgres
- Supabase Auth with role-based access (viewer / reviewer / editor / admin)
- OpenAI-compatible AI provider (mock + live)
- Vercel Cron for scheduled ingestion

## First Run (mock mode — no credentials needed)

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

`MOCK_MODE=true` is the default. The app runs fully on mock data without Reddit, AI, or Supabase credentials.

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript check only |
| `pnpm lint` | ESLint |
| `pnpm test` | Run vitest suite (31 tests) |
| `pnpm test:coverage` | Coverage report |
| `pnpm prisma:generate` | Regenerate Prisma client |
| `pnpm prisma:migrate` | Run DB migrations |
| `pnpm seed` | Seed default sources + admin user |

## Environment Variables

### Required for live mode (`MOCK_MODE=false`)

| Variable | Description |
|---|---|
| `MOCK_MODE` | `false` to enable persistence and live AI. Default: `true` |
| `DATABASE_URL` | Supabase Postgres connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **server-side only**, never expose to client |
| `CRON_SECRET` | Bearer token for cron route authorization |
| `AI_API_KEY` | OpenAI-compatible API key |
| `AI_BASE_URL` | Optional custom base URL (e.g. for Together, Groq, Ollama) |
| `AI_MODEL` | Model name. Default: `gpt-4o-mini` |
| `REDDIT_CLIENT_ID` | Reddit OAuth app client ID |
| `REDDIT_CLIENT_SECRET` | Reddit OAuth app client secret |
| `REDDIT_USER_AGENT` | Reddit API user-agent string |
| `NEXT_PUBLIC_SITE_URL` | Public URL for sitemap + OG metadata. Default: `https://stlsignals.dev` |

Copy `.env.example` and fill in values. Never commit `.env.local`.

## Roles Setup

Roles are stored in Supabase `user_metadata.role`. To grant admin access:

```bash
SUPABASE_SERVICE_ROLE_KEY=<key> ADMIN_EMAIL=<email> npx tsx scripts/seed-admin.ts
```

Role hierarchy: `viewer < reviewer < editor < admin`

## Cron Schedule (vercel.json)

| Route | Schedule | Purpose |
|---|---|---|
| `/api/jobs/fetch-reddit` | Every 6h | Fetch new posts from monitored subreddits |
| `/api/jobs/detect-signals` | Every 6h +30m | Cluster posts into trend signals |
| `/api/jobs/generate-research-packet` | 02:00 daily | Generate research packets for new signals |
| `/api/jobs/generate-draft` | 02:30 daily | Generate draft from highest-scoring signal |
| `/api/jobs/repurpose` | 03:00 daily | Repurpose approved drafts to 6 platforms |

All cron routes require `Authorization: Bearer $CRON_SECRET` when the env var is set.

Manual trigger:
```bash
curl -X POST http://localhost:3000/api/jobs/fetch-reddit \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Architecture

```
Reddit API
    ↓ fetch-reddit job
RawPost (DB)
    ↓ detect-signals job (LLM clustering + dedup)
Signal (DB)
    ↓ generate-research-packet job
ResearchPacket (stored on Signal)
    ↓ generate-draft job
Draft (DB) → manual editorial review
    ↓ approve
repurpose job → ContentRepurpose (DB)
    ↓
/blog/[slug] (public), /feed.xml, /sitemap.xml
```

## Safety Rules

- Store only Reddit post metadata and short snippets (max 280 chars).
- Deduplicate posts by external Reddit ID.
- Respect rate-limit headers — exponential backoff on 429/503.
- Generate original analysis from metadata patterns, never copy post content verbatim.
- Attribute: _"Signals observed from public Reddit discussions"_.
- Human editorial approval required before any draft is published.
- SHA-256 author hashing — no Reddit usernames stored.
- No auto-posting or auto-commenting to Reddit.
- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed client-side.
