import type { Prisma } from "@prisma/client";
import type { ResearchPacket, SignalStatus, DraftStatus } from "@/lib/data/types";
import { mockDrafts, mockPosts, mockSignals, mockSources } from "@/lib/data/mock";
import { prisma } from "@/lib/data/prisma";
import type { DashboardMetrics, Draft, Signal, Source } from "@/lib/data/types";

const useMockMode = process.env.MOCK_MODE !== "false";

type PrismaSignalWithPosts = Prisma.SignalGetPayload<{
  include: { posts: { include: { rawPost: true } } };
}>;

type PrismaDraft = Prisma.DraftGetPayload<Record<never, never>>;

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapRawPost(rawPost: Prisma.RawPostGetPayload<Record<never, never>>) {
  return {
    id: rawPost.id,
    sourceId: rawPost.sourceId,
    externalId: rawPost.externalId,
    title: rawPost.title,
    url: rawPost.url,
    subreddit: rawPost.subreddit,
    authorHash: rawPost.authorHash,
    score: rawPost.score,
    commentCount: rawPost.commentCount,
    createdUtc: rawPost.createdUtc.toISOString(),
    permalink: rawPost.permalink,
    contentSnippet: rawPost.contentSnippet,
    fetchedAt: rawPost.fetchedAt.toISOString()
  };
}

function mapSignal(signal: PrismaSignalWithPosts): Signal {
  return {
    id: signal.id,
    title: signal.title,
    summary: signal.summary,
    topic: signal.topic,
    keywords: parseJsonArray(signal.keywords),
    score: signal.score,
    confidence: signal.confidence,
    sourceCount: signal.sourceCount,
    status: signal.status as SignalStatus,
    createdAt: signal.createdAt.toISOString(),
    updatedAt: signal.updatedAt.toISOString(),
    posts: signal.posts.map(({ rawPost }) => mapRawPost(rawPost)),
    suggestedAngle: `Turn this ${signal.topic} signal into a practical engineering brief.`,
    topicClusterId: signal.topicClusterId ?? undefined,
    researchPacket: signal.researchPacket
      ? (JSON.parse(signal.researchPacket) as ResearchPacket)
      : undefined
  };
}

function mapDraft(draft: PrismaDraft): Draft {
  return {
    id: draft.id,
    signalId: draft.signalId,
    title: draft.title,
    slug: draft.slug,
    excerpt: draft.excerpt,
    contentMarkdown: draft.contentMarkdown,
    seoTitle: draft.seoTitle,
    seoDescription: draft.seoDescription,
    status: draft.status as DraftStatus,
    version: draft.version,
    editorialNotes: draft.editorialNotes,
    tags: parseJsonArray(draft.tags),
    faqs: draft.faqs
      ? (JSON.parse(draft.faqs) as Array<{ question: string; answer: string }>)
      : null,
    createdAt: draft.createdAt.toISOString(),
    updatedAt: draft.updatedAt.toISOString(),
    publishedAt: draft.publishedAt?.toISOString() ?? null
  };
}

export async function getSources(): Promise<Source[]> {
  if (useMockMode) {
    return mockSources;
  }

  const sources = await prisma.source.findMany({
    orderBy: [{ enabled: "desc" }, { name: "asc" }]
  });

  return sources.map((source) => ({
    id: source.id,
    type: source.type as "reddit",
    name: source.name,
    subreddit: source.subreddit,
    enabled: source.enabled,
    keywords: parseJsonArray(source.keywords),
    scanFrequency: source.scanFrequency,
    lastFetchedAt: source.lastFetchedAt?.toISOString() ?? null,
    createdAt: source.createdAt.toISOString(),
    updatedAt: source.updatedAt.toISOString()
  }));
}

export async function getSignals(): Promise<Signal[]> {
  if (useMockMode) {
    return mockSignals;
  }

  const signals = await prisma.signal.findMany({
    include: {
      posts: {
        include: {
          rawPost: true
        }
      }
    },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }]
  });

  return signals.map(mapSignal);
}

export async function getSignal(id: string): Promise<Signal | undefined> {
  if (useMockMode) {
    return mockSignals.find((s) => s.id === id);
  }

  const signal = await prisma.signal.findUnique({
    where: { id },
    include: {
      posts: {
        include: { rawPost: true }
      }
    }
  });

  return signal ? mapSignal(signal) : undefined;
}

export async function getDrafts(): Promise<Draft[]> {
  if (useMockMode) {
    return mockDrafts;
  }

  const drafts = await prisma.draft.findMany({
    orderBy: [{ updatedAt: "desc" }]
  });

  return drafts.map(mapDraft);
}

export async function getPublishedDrafts(): Promise<Draft[]> {
  const drafts = await getDrafts();
  return drafts.filter((draft) => draft.status === "published" || draft.status === "approved");
}

export async function getDraftBySlug(slug: string): Promise<Draft | undefined> {
  return (await getPublishedDrafts()).find((draft) => draft.slug === slug);
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [signals, drafts, sources] = await Promise.all([getSignals(), getDrafts(), getSources()]);
  return {
    signals: signals.length,
    drafts: drafts.length,
    published: drafts.filter((draft) => draft.status === "published").length,
    monitoredSources: sources.filter((source) => source.enabled).length
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getSignalsPaginated(page = 1, pageSize = 20): Promise<PaginatedResult<Signal>> {
  if (useMockMode) {
    const start = (page - 1) * pageSize;
    const items = mockSignals.slice(start, start + pageSize);
    return { items, total: mockSignals.length, page, pageSize, totalPages: Math.ceil(mockSignals.length / pageSize) };
  }

  const [signals, total] = await Promise.all([
    prisma.signal.findMany({
      include: { posts: { include: { rawPost: true } } },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.signal.count()
  ]);

  return { items: signals.map(mapSignal), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getDraftsPaginated(page = 1, pageSize = 20): Promise<PaginatedResult<Draft>> {
  if (useMockMode) {
    const start = (page - 1) * pageSize;
    const items = mockDrafts.slice(start, start + pageSize);
    return { items, total: mockDrafts.length, page, pageSize, totalPages: Math.ceil(mockDrafts.length / pageSize) };
  }

  const [drafts, total] = await Promise.all([
    prisma.draft.findMany({
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.draft.count()
  ]);

  return { items: drafts.map(mapDraft), total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function searchSignals(q: string): Promise<Signal[]> {
  if (useMockMode) {
    const lower = q.toLowerCase();
    return mockSignals.filter(
      (s) => s.title.toLowerCase().includes(lower) || s.summary.toLowerCase().includes(lower)
    );
  }

  // SQLite LIKE is case-insensitive for ASCII by default
  const signals = await prisma.signal.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { summary: { contains: q } }
      ]
    },
    include: { posts: { include: { rawPost: true } } },
    orderBy: [{ score: "desc" }],
    take: 50
  });

  return signals.map(mapSignal);
}

export async function searchDrafts(q: string): Promise<Draft[]> {
  if (useMockMode) {
    const lower = q.toLowerCase();
    return mockDrafts.filter(
      (d) => d.title.toLowerCase().includes(lower) || d.excerpt.toLowerCase().includes(lower)
    );
  }

  const drafts = await prisma.draft.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { excerpt: { contains: q } },
        { contentMarkdown: { contains: q } }
      ]
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 50
  });

  return drafts.map(mapDraft);
}

export async function getRecentPosts() {
  if (useMockMode) {
    return mockPosts;
  }

  const posts = await prisma.rawPost.findMany({
    orderBy: [{ createdUtc: "desc" }],
    take: 100
  });

  return posts.map(mapRawPost);
}
