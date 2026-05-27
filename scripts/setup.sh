#!/usr/bin/env bash
set -e

echo "=== STL Signals — Local Setup ==="

# Create .env from .env.example if missing
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example."
  echo "  → Edit REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET before running pnpm pipeline."
fi

# Use SQLite by default
export DATABASE_URL="${DATABASE_URL:-file:./stl-signals.db}"

echo ""
echo "Running database migrations..."
DATABASE_URL="$DATABASE_URL" npx prisma migrate dev --name init

echo ""
echo "Seeding database with sample data..."
DATABASE_URL="$DATABASE_URL" npx tsx scripts/seed.ts

echo ""
echo "=== Setup complete ==="
echo "  pnpm dev        → start dashboard at http://localhost:3000"
echo "  pnpm pipeline   → fetch Reddit posts + detect signals"
echo "  pnpm reddit:test → smoke-test Reddit OAuth credentials"
