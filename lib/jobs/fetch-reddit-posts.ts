import { prisma } from "@/lib/data/prisma";
import { getSources } from "@/lib/data/repository";
import { fetchRedditPostsForSubreddit } from "@/lib/reddit/client";
import { createJobLogger } from "@/lib/utils/logger";

const useMockMode = process.env.MOCK_MODE !== "false";
const COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours — matches cron interval

export async function fetchRedditPostsJob() {
  const logger = createJobLogger("fetch-reddit-posts");
  const sources = (await getSources()).filter((source) => source.enabled && source.type === "reddit");
  logger.info("starting", { sourceCount: sources.length, mode: useMockMode ? "mock" : "live" });

  const results = [];

  for (const source of sources) {
    if (!useMockMode && source.lastFetchedAt) {
      const age = Date.now() - new Date(source.lastFetchedAt).getTime();
      if (age < COOLDOWN_MS) {
        logger.info("skipping (cooldown)", { subreddit: source.subreddit, remainingMs: COOLDOWN_MS - age });
        results.push({ sourceId: source.id, subreddit: source.subreddit, fetched: 0, stored: 0, skipped: true });
        continue;
      }
    }

    logger.info("fetching subreddit", { subreddit: source.subreddit });
    const posts = await withBackoff(() =>
      fetchRedditPostsForSubreddit(source.subreddit, source.keywords)
    );

    let stored = 0;
    if (!useMockMode) {
      for (const post of posts) {
        await prisma.rawPost.upsert({
          where: { externalId: post.externalId },
          update: {
            score: post.score,
            commentCount: post.commentCount,
            contentSnippet: post.contentSnippet
          },
          create: {
            sourceId: source.id,
            externalId: post.externalId,
            title: post.title,
            url: post.url,
            subreddit: post.subreddit,
            authorHash: post.authorHash,
            score: post.score,
            commentCount: post.commentCount,
            createdUtc: post.createdUtc,
            permalink: post.permalink,
            contentSnippet: post.contentSnippet
          }
        });
        stored++;
      }
    }

    if (!useMockMode) {
      await prisma.source.update({
        where: { id: source.id },
        data: { lastFetchedAt: new Date() }
      });
    }

    results.push({
      sourceId: source.id,
      subreddit: source.subreddit,
      fetched: posts.length,
      stored: useMockMode ? 0 : stored,
      mode: useMockMode ? "mock" : "live"
    });
  }

  logger.done("complete", { sources: results.length, totalFetched: results.reduce((n, r) => n + r.fetched, 0) });
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
