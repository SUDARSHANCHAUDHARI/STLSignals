import crypto from "node:crypto";
import { toSnippet } from "@/lib/utils/safety";

type RedditListingChild = {
  data: {
    id: string;
    title: string;
    url: string;
    subreddit: string;
    author: string;
    score: number;
    num_comments: number;
    created_utc: number;
    permalink: string;
    selftext?: string;
  };
};

export type RedditPostInput = {
  externalId: string;
  title: string;
  url: string;
  subreddit: string;
  authorHash: string;
  score: number;
  commentCount: number;
  createdUtc: Date;
  permalink: string;
  contentSnippet: string;
};

export async function fetchRedditPostsForSubreddit(subreddit: string, keywords: string[]) {
  if (process.env.MOCK_MODE !== "false" || !process.env.REDDIT_CLIENT_ID) {
    return mockRedditPosts(subreddit, keywords);
  }

  const token = await getRedditToken();
  const response = await fetch(`https://oauth.reddit.com/r/${subreddit}/hot?limit=50`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": process.env.REDDIT_USER_AGENT ?? "STLSignals/0.1"
    },
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Reddit rate limit reached. Retry after the advertised reset window.");
    }
    throw new Error(`Reddit fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as { data: { children: RedditListingChild[] } };
  return payload.data.children
    .map(({ data }) => ({
      externalId: data.id,
      title: data.title,
      url: data.url,
      subreddit: data.subreddit,
      authorHash: hashAuthor(data.author),
      score: data.score,
      commentCount: data.num_comments,
      createdUtc: new Date(data.created_utc * 1000),
      permalink: data.permalink,
      contentSnippet: toSnippet(data.selftext || data.title)
    }))
    .filter((post) => matchesKeywords(post.title, keywords));
}

async function getRedditToken() {
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;

  if (!id || !secret) {
    throw new Error("Missing Reddit OAuth credentials.");
  }

  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": process.env.REDDIT_USER_AGENT ?? "STLSignals/0.1"
    },
    body: new URLSearchParams({ grant_type: "client_credentials" })
  });

  if (!response.ok) {
    throw new Error(`Reddit OAuth failed: ${response.status}`);
  }

  const payload = (await response.json()) as { access_token: string };
  return payload.access_token;
}

function mockRedditPosts(subreddit: string, keywords: string[]): RedditPostInput[] {
  const keyword = keywords[0] ?? "engineering";
  return [
    {
      externalId: `mock_${subreddit}_${keyword}`.replace(/[^a-zA-Z0-9_]/g, "_"),
      title: `${subreddit} discussion points to ${keyword} becoming a practical team priority`,
      url: `https://www.reddit.com/r/${subreddit}/comments/mock`,
      subreddit,
      authorHash: "sha256:mock-author",
      score: 120,
      commentCount: 28,
      createdUtc: new Date(),
      permalink: `/r/${subreddit}/comments/mock`,
      contentSnippet: `Short metadata-only mock snippet for ${keyword}; no full Reddit content is stored.`
    }
  ];
}

function hashAuthor(author: string) {
  return `sha256:${crypto.createHash("sha256").update(author).digest("hex")}`;
}

function matchesKeywords(title: string, keywords: string[]) {
  if (keywords.length === 0) {
    return true;
  }
  const lowerTitle = title.toLowerCase();
  return keywords.some((keyword) => lowerTitle.includes(keyword.toLowerCase()));
}
