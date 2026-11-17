import type { RawPost, TopicCluster } from "@/lib/data/types";

export type ScoredSignal = {
  topic: string;
  title: string;
  summary: string;
  keywords: string[];
  score: number;
  confidence: number;
  sourceCount: number;
  posts: RawPost[];
};

export function scorePosts(topic: string, posts: RawPost[]): ScoredSignal {
  const engagement = posts.reduce((total, post) => total + post.score + post.commentCount * 2, 0);
  const score = Math.min(100, Math.round(40 + posts.length * 12 + engagement / 20));
  const confidence = Math.min(0.95, 0.5 + posts.length * 0.1 + Math.min(engagement, 500) / 2000);

  return {
    topic,
    title: topicToTitle(topic),
    summary: topicToSummary(topic),
    keywords: extractKeywords(posts),
    score,
    confidence: Math.round(confidence * 100) / 100,
    sourceCount: posts.length,
    posts
  };
}

export function inferTopic(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("flaky") || lower.includes("qa") || lower.includes("test")) {
    return "quality-engineering";
  }
  if (lower.includes("secret") || lower.includes("security") || lower.includes("vuln")) {
    return "cybersecurity";
  }
  return "developer-tooling";
}

export function clusterPostsByTopic(posts: RawPost[]): TopicCluster[] {
  const grouped = new Map<string, string[]>();
  for (const post of posts) {
    const topic = inferTopic(post.title);
    grouped.set(topic, [...(grouped.get(topic) ?? []), post.id]);
  }
  return [...grouped.entries()].map(([topic, postIds]) => ({
    topic,
    label: topic.replace(/-/g, " "),
    keywords: [],
    postIds,
    confidence: 0.7
  }));
}

function topicToTitle(topic: string): string {
  const titles: Record<string, string> = {
    "quality-engineering": "Quality engineering workflow changes are gaining attention",
    cybersecurity: "Repository security guardrails are becoming baseline practice",
    "developer-tooling": "Developer platform teams are absorbing AI governance work"
  };
  return titles[topic] ?? "Engineering trend detected";
}

function topicToSummary(topic: string): string {
  const summaries: Record<string, string> = {
    "quality-engineering":
      "Engineering discussions point to growing interest in test ownership, CI reliability, and AI-assisted quality workflows.",
    cybersecurity:
      "Security conversations highlight practical guardrails for repositories, secrets management, and supply chain hygiene.",
    "developer-tooling":
      "Platform engineering discussions are absorbing AI tool governance, developer experience, and internal tooling decisions."
  };
  return summaries[topic] ?? "An emerging engineering trend has been detected from recent community discussions.";
}

function extractKeywords(posts: RawPost[]): string[] {
  const counts = new Map<string, number>();
  const stopWords = new Set(["the", "a", "an", "is", "are", "for", "and", "or", "to", "of", "in", "on", "with", "as"]);

  for (const post of posts) {
    for (const word of post.title.toLowerCase().split(/\W+/)) {
      if (word.length > 3 && !stopWords.has(word)) {
        counts.set(word, (counts.get(word) ?? 0) + 1);
      }
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);
}
