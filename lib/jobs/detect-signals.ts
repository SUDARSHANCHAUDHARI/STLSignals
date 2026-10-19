import { prisma } from "@/lib/data/prisma";
import { getRecentPosts } from "@/lib/data/repository";
import { clusterPostsByTopic, scorePosts } from "@/lib/services/signal-scorer";
import { createJobLogger } from "@/lib/utils/logger";

const useMockMode = process.env.MOCK_MODE !== "false";

export async function detectSignalsJob() {
  const logger = createJobLogger("detect-signals");
  const posts = await getRecentPosts();
  logger.info("starting", { postCount: posts.length, mode: useMockMode ? "mock" : "live" });

  if (posts.length === 0) {
    logger.info("no posts to process");
    return { ok: true, signals: [] };
  }

  const clusters = clusterPostsByTopic(posts);

  const scored = clusters.map((cluster) => {
    const clusterPosts = posts.filter((p) => cluster.postIds.includes(p.id));
    const signal = scorePosts(cluster.topic, clusterPosts);
    return {
      ...signal,
      keywords: cluster.keywords.length > 0 ? cluster.keywords : signal.keywords,
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
          data: {
            title: signal.title,
            summary: signal.summary,
            keywords: JSON.stringify(signal.keywords),
            score: signal.score,
            confidence: signal.confidence,
            sourceCount: signal.sourceCount
          }
        });
        signalId = existing.id;
      } else {
        const created = await prisma.signal.create({
          data: {
            title: signal.title,
            summary: signal.summary,
            topic: signal.topic,
            keywords: JSON.stringify(signal.keywords),
            score: signal.score,
            confidence: signal.confidence,
            sourceCount: signal.sourceCount
          }
        });
        signalId = created.id;
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

  const output = {
    ok: true,
    signals: scored.map(({ topic, title, summary, keywords, score, confidence, sourceCount }) => ({
      topic, title, summary, keywords, score, confidence, sourceCount
    }))
  };
  logger.done("complete", { clustersDetected: output.signals.length });
  return output;
}
