#!/usr/bin/env tsx
/**
 * Smoke-test Reddit OAuth credentials and API access.
 * Run: pnpm reddit:test
 * Requires REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in .env
 */

const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const USER_AGENT = process.env.REDDIT_USER_AGENT ?? "STLSignals/0.1 by SudarshanTechLabs";

async function main() {
  console.log("=== Reddit OAuth Smoke Test ===\n");

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET must be set in .env");
    console.error("Get credentials at: https://www.reddit.com/prefs/apps");
    process.exit(1);
  }

  console.log(`Client ID: ${CLIENT_ID.slice(0, 6)}...`);
  console.log(`User-Agent: ${USER_AGENT}\n`);

  // Step 1: Fetch token
  console.log("1. Fetching access token...");
  const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT
    },
    body: new URLSearchParams({ grant_type: "client_credentials" })
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    console.error(`OAuth failed: HTTP ${tokenRes.status}`);
    console.error(body);
    process.exit(1);
  }

  const { access_token, token_type, expires_in } = (await tokenRes.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };

  console.log(`   Token type: ${token_type}`);
  console.log(`   Expires in: ${expires_in}s`);
  console.log("   OK\n");

  // Step 2: Fetch a subreddit
  const subreddit = "programming";
  console.log(`2. Fetching r/${subreddit}/hot (limit=5)...`);
  const listRes = await fetch(`https://oauth.reddit.com/r/${subreddit}/hot?limit=5`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "User-Agent": USER_AGENT
    }
  });

  if (!listRes.ok) {
    console.error(`Listing fetch failed: HTTP ${listRes.status}`);
    if (listRes.status === 429) console.error("Rate limited — wait before retrying.");
    process.exit(1);
  }

  const listing = (await listRes.json()) as { data: { children: Array<{ data: { title: string; score: number } }> } };
  const posts = listing.data.children;

  console.log(`   Received ${posts.length} posts:`);
  for (const { data } of posts) {
    console.log(`   • [${data.score}] ${data.title.slice(0, 80)}`);
  }
  console.log("   OK\n");

  console.log("=== All checks passed — Reddit credentials are valid ===");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
