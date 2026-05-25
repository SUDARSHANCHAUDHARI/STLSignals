import { getRecentPosts } from "@/lib/data/repository";

export async function detectSignalsJob() {
  const posts = await getRecentPosts();
  const grouped = new Map<string, typeof posts>();

  for (const post of posts) {
    const topic = inferTopic(post.title);
    grouped.set(topic, [...(grouped.get(topic) ?? []), post]);
  }

  const signals = [...grouped.entries()].map(([topic, topicPosts]) => {
    const engagement = topicPosts.reduce((total, post) => total + post.score + post.commentCount * 2, 0);
    return {
      topic,
      title: topicToTitle(topic),
      sourceCount: topicPosts.length,
      score: Math.min(100, Math.round(40 + topicPosts.length * 12 + engagement / 20)),
      postIds: topicPosts.map((post) => post.id)
    };
  });

  // TODO: Persist Signal and SignalPost rows after replacing mock repository functions.
  return { ok: true, signals };
}

function inferTopic(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("flaky") || lower.includes("qa") || lower.includes("test")) {
    return "quality-engineering";
  }
  if (lower.includes("secret") || lower.includes("security")) {
    return "cybersecurity";
  }
  return "developer-tooling";
}

function topicToTitle(topic: string) {
  const titles: Record<string, string> = {
    "quality-engineering": "Quality engineering workflow changes are gaining attention",
    cybersecurity: "Repository security guardrails are becoming baseline practice",
    "developer-tooling": "Developer platform teams are absorbing AI governance work"
  };
  return titles[topic] ?? "Engineering trend detected";
}
