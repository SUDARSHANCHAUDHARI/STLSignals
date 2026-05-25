import { mockDrafts, mockPosts, mockSignals, mockSources } from "@/lib/data/mock";
import type { DashboardMetrics, Draft, Signal, Source } from "@/lib/data/types";

const useMockMode = process.env.MOCK_MODE !== "false";

export async function getSources(): Promise<Source[]> {
  if (!useMockMode) {
    // TODO: Replace with Prisma or Supabase queries once production auth/RLS is configured.
  }
  return mockSources;
}

export async function getSignals(): Promise<Signal[]> {
  if (!useMockMode) {
    // TODO: Replace with Prisma join against SignalPost and RawPost.
  }
  return mockSignals;
}

export async function getSignal(id: string): Promise<Signal | undefined> {
  return (await getSignals()).find((signal) => signal.id === id);
}

export async function getDrafts(): Promise<Draft[]> {
  if (!useMockMode) {
    // TODO: Replace with Prisma Draft queries.
  }
  return mockDrafts;
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

export async function getRecentPosts() {
  return mockPosts;
}
