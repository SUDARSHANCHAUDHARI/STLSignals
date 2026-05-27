import { createAiProvider } from "@/lib/ai/provider";
import { prisma } from "@/lib/data/prisma";
import { getRecentPosts } from "@/lib/data/repository";
import { inferTopic, scorePosts } from "@/lib/services/signal-scorer";
import { isDuplicateSignal } from "@/lib/services/duplicate-detector";

const useMockMode = process.env.MOCK_MODE !== "false";

export async function detectSignalsJob() {
  const posts = await getRecentPosts();
  if (posts.length === 0) return { ok: true, signals: [] };

  // Cluster posts: LLM in live mode, keyword inference in mock mode
  const clusters = useMockMode
    ? keywordCluster(posts)
    : await clusterWithAI(posts);

  const scored = clusters.map((cluster) => {
    const clusterPosts = posts.filter((p) => cluster.postIds.includes(p.id));
    return {
      ...scorePosts(cluster.topic, clusterPosts),
      keywords: cluster.keywords.length > 0 ? cluster.keywords : scorePosts(cluster.topic, clusterPosts).keywords,
      confidence: cluster.confidence
    };
  });

  if (!useMockMode) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const signal of scored) {
      const existing = await prisma.signal.findFirst({
        where: { topic: signal.topic, createdAt: { gte: oneDayAgo } }
      });

      let signalId: string;

      if (existing) {
        await prisma.signal.update({
          where: { id: existing.id },
          data: { score: signal.score, confidence: signal.confidence, sourceCount: signal.sourceCount }
        });
        signalId = existing.id;
      } else {
        const created = await prisma.signal.create({
          data: {
            title: signal.title,
            summary: signal.summary,
            topic: signal.topic,
            keywords: signal.keywords,
            score: signal.score,
            confidence: signal.confidence,
            sourceCount: signal.sourceCount
          }
        });
        signalId = created.id;

        // Duplicate detection — runs after creation so we have an ID to store the embedding against
        const candidateText = `${signal.title} ${signal.summary}`;
        const dupeResult = await isDuplicateSignal(signalId, candidateText);
        if (dupeResult.isDuplicate) {
          await prisma.signal.update({
            where: { id: signalId },
            data: { status: "ignored" }
          });
          continue;
        }
      }

      for (const post of signal.posts) {
        await prisma.signalPost.upsert({
          where: { signalId_rawPostId: { signalId, rawPostId: post.id } },
          update: {},
          create: { signalId, rawPostId: post.id }
        });
      }
    }
  }

  return {
    ok: true,
    signals: scored.map(({ topic, title, summary, keywords, score, confidence, sourceCount }) => ({
      topic, title, summary, keywords, score, confidence, sourceCount
    }))
  };
}

function keywordCluster(posts: ReturnType<typeof Array.prototype.filter>) {
  const grouped = new Map<string, string[]>();
  for (const post of posts as Array<{ id: string; title: string }>) {
    const topic = inferTopic(post.title);
    grouped.set(topic, [...(grouped.get(topic) ?? []), post.id]);
  }
  return [...grouped.entries()].map(([topic, postIds]) => ({
    topic,
    label: topic.replace(/-/g, " "),
    keywords: [] as string[],
    postIds,
    confidence: 0.7
  }));
}

async function clusterWithAI(posts: Awaited<ReturnType<typeof getRecentPosts>>) {
  try {
    const provider = createAiProvider();
    return await provider.clusterPosts(posts);
  } catch {
    // Fall back to keyword clustering if LLM call fails
    return keywordCluster(posts);
  }
}
