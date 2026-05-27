import { prisma } from "@/lib/data/prisma";
import { getRecentPosts } from "@/lib/data/repository";
import { inferTopic, scorePosts } from "@/lib/services/signal-scorer";

const useMockMode = process.env.MOCK_MODE !== "false";

export async function detectSignalsJob() {
  const posts = await getRecentPosts();
  const grouped = new Map<string, typeof posts>();

  for (const post of posts) {
    const topic = inferTopic(post.title);
    grouped.set(topic, [...(grouped.get(topic) ?? []), post]);
  }

  const scored = [...grouped.entries()].map(([topic, topicPosts]) =>
    scorePosts(topic, topicPosts)
  );

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
            keywords: signal.keywords,
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

  return {
    ok: true,
    signals: scored.map(({ topic, title, summary, keywords, score, confidence, sourceCount }) => ({
      topic, title, summary, keywords, score, confidence, sourceCount
    }))
  };
}
