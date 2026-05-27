export type SourceStatus = "enabled" | "disabled";
export type SignalStatus = "new" | "reviewed" | "draft_created" | "published" | "ignored";
export type DraftStatus = "draft" | "reviewing" | "approved" | "scheduled" | "published" | "archived" | "rejected";

export type Source = {
  id: string;
  type: "reddit";
  name: string;
  subreddit: string;
  enabled: boolean;
  keywords: string[];
  scanFrequency: string;
  createdAt: string;
  updatedAt: string;
};

export type RawPost = {
  id: string;
  sourceId: string;
  externalId: string;
  title: string;
  url: string;
  subreddit: string;
  authorHash: string;
  score: number;
  commentCount: number;
  createdUtc: string;
  permalink: string;
  contentSnippet: string;
  fetchedAt: string;
};

export type Signal = {
  id: string;
  title: string;
  summary: string;
  topic: string;
  keywords: string[];
  score: number;
  confidence: number;
  sourceCount: number;
  status: SignalStatus;
  createdAt: string;
  updatedAt: string;
  posts: RawPost[];
  suggestedAngle: string;
  topicClusterId?: string;
  researchPacket?: Record<string, unknown>;
};

export type Draft = {
  id: string;
  signalId: string;
  title: string;
  slug: string;
  excerpt: string;
  contentMarkdown: string;
  seoTitle: string;
  seoDescription: string;
  status: DraftStatus;
  version: number;
  editorialNotes: string | null;
  tags: string[];
  faqs: Array<{ question: string; answer: string }> | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type DashboardMetrics = {
  signals: number;
  drafts: number;
  published: number;
  monitoredSources: number;
};
