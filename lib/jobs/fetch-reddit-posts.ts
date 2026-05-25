import { getSources } from "@/lib/data/repository";
import { fetchRedditPostsForSubreddit } from "@/lib/reddit/client";

export async function fetchRedditPostsJob() {
  const sources = (await getSources()).filter((source) => source.enabled && source.type === "reddit");
  const results = [];

  for (const source of sources) {
    const posts = await withBackoff(() =>
      fetchRedditPostsForSubreddit(source.subreddit, source.keywords)
    );

    results.push({
      sourceId: source.id,
      subreddit: source.subreddit,
      fetched: posts.length,
      stored: posts.length,
      mode: process.env.MOCK_MODE !== "false" ? "mock" : "live"
    });

    // TODO: Persist with Prisma upsert by externalId.
  }

  return { ok: true, results };
}

async function withBackoff<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    }
  }
  throw lastError;
}
