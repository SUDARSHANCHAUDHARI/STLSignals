# STL Signals

STL Signals is a production-oriented MVP for AI-assisted trend discovery and content drafting. It uses public Reddit discussions as signal input, clusters useful engineering/QA/AI/cybersecurity/dev-tooling trends, creates original summaries, and prepares blog drafts for manual review.

The MVP intentionally does not auto-post to Reddit and does not copy full Reddit posts or comments into articles.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS with shadcn-style primitives
- Prisma schema for Supabase Postgres
- OpenAI-compatible provider abstraction
- Reddit OAuth integration path with mock mode
- Vercel and cron-ready route handlers

## Quick Start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Mock mode is enabled by default with `MOCK_MODE=true`, so the app works without Reddit, AI, or Supabase credentials.

## Useful Commands

```bash
pnpm build
pnpm typecheck
pnpm prisma:generate
pnpm seed
```

## Environment

Set these before production deployment:

- `DATABASE_URL`
- `CRON_SECRET`
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `REDDIT_USER_AGENT`
- `AI_API_KEY`
- `AI_BASE_URL`
- `AI_MODEL`

## Cron Routes

All cron routes require `Authorization: Bearer $CRON_SECRET` when `CRON_SECRET` is set.

- `POST /api/jobs/fetch-reddit`
- `POST /api/jobs/detect-signals`
- `POST /api/jobs/generate-draft`

## Safety Rules

- Store only Reddit metadata and short snippets.
- Deduplicate Reddit posts by external ID.
- Respect Reddit rate-limit headers and retry with backoff.
- Generate original summaries and analysis only.
- Require manual approval before public publishing.
- Attribute source context as "Signals observed from public Reddit discussions".
- Do not use Reddit branding as product identity.
- Do not auto-comment or auto-submit to Reddit in the MVP.

## Production TODOs

- Persist job outputs with Prisma upserts for fetched posts, detected signals, generated drafts, and audit logs.
- Add Supabase Row Level Security policies for admin/editor roles.
- Add encrypted secret storage for API credentials.
- Add queue-backed jobs for larger source sets.
- Add AI moderation/evaluation checks before draft approval.
- Add tests around signal scoring, snippet truncation, and draft safety.
- Add Vercel cron definitions once deployment cadence is chosen.
