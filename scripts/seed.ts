import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const source = await prisma.source.upsert({
    where: { id: "seed-reddit-quality" },
    update: {},
    create: {
      id: "seed-reddit-quality",
      name: "Quality Engineering Signals",
      subreddit: "QualityAssurance",
      keywords: ["qa", "testing", "automation", "ci"],
      scanFrequency: "daily"
    }
  });

  const post = await prisma.rawPost.upsert({
    where: { externalId: "mock_qa_ci_flake" },
    update: {},
    create: {
      sourceId: source.id,
      externalId: "mock_qa_ci_flake",
      title: "Teams are revisiting flaky test triage after heavier AI coding adoption",
      url: "https://www.reddit.com/r/QualityAssurance/comments/mock",
      subreddit: "QualityAssurance",
      authorHash: "demo-author",
      score: 184,
      commentCount: 42,
      createdUtc: new Date("2026-05-20T09:00:00.000Z"),
      permalink: "/r/QualityAssurance/comments/mock",
      contentSnippet: "Short metadata-only snippet for local seed data."
    }
  });

  const signal = await prisma.signal.upsert({
    where: { id: "seed-signal-flaky-tests" },
    update: {},
    create: {
      id: "seed-signal-flaky-tests",
      title: "Flaky test ownership is becoming an AI-era QA priority",
      topic: "quality-engineering",
      summary: "Engineering teams are looking for better ways to connect flaky tests to ownership, deployment risk, and AI-assisted code changes.",
      keywords: ["flaky tests", "ownership", "ci", "ai coding"],
      score: 86,
      confidence: 0.78,
      sourceCount: 1
    }
  });

  await prisma.signalPost.upsert({
    where: { signalId_rawPostId: { signalId: signal.id, rawPostId: post.id } },
    update: {},
    create: { signalId: signal.id, rawPostId: post.id }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
