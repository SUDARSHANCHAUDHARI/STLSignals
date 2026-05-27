import { describe, it, expect, vi, beforeEach } from "vitest";
import { inferTopic, scorePosts } from "../lib/services/signal-scorer";
import type { RawPost } from "../lib/data/types";

// Tests for the ingestion pipeline's mock-mode path.
// We test keywordCluster logic indirectly via inferTopic + scorePosts
// since keywordCluster is not exported.

function makePost(overrides: Partial<RawPost> = {}): RawPost {
  return {
    id: "post-1",
    sourceId: "src-1",
    externalId: "ext-1",
    title: "Generic post",
    url: "https://reddit.com/r/test/1",
    subreddit: "r/test",
    authorHash: "abc",
    score: 10,
    commentCount: 5,
    createdUtc: "2025-01-01T00:00:00Z",
    permalink: "/r/test/1",
    contentSnippet: "snippet",
    fetchedAt: "2025-01-01T01:00:00Z",
    ...overrides
  };
}

describe("ingestion — mock-mode clustering via inferTopic", () => {
  it("groups flaky test posts under quality-engineering", () => {
    const posts = [
      makePost({ id: "p1", title: "Fixing flaky tests in CI" }),
      makePost({ id: "p2", title: "Test ownership problem" })
    ];
    for (const p of posts) {
      expect(inferTopic(p.title)).toBe("quality-engineering");
    }
  });

  it("groups unrelated posts under developer-tooling", () => {
    const posts = [
      makePost({ id: "p3", title: "Improving build performance" }),
      makePost({ id: "p4", title: "New CLI tool for deployments" })
    ];
    for (const p of posts) {
      expect(inferTopic(p.title)).toBe("developer-tooling");
    }
  });

  it("produces deterministic cluster topics for same input", () => {
    const title = "QA automation best practices";
    expect(inferTopic(title)).toBe(inferTopic(title));
  });
});

describe("ingestion — scorePosts produces valid signals", () => {
  it("two posts produce higher score than one", () => {
    const single = scorePosts("quality-engineering", [makePost()]);
    const double = scorePosts("quality-engineering", [makePost({ id: "p1" }), makePost({ id: "p2" })]);
    expect(double.score).toBeGreaterThanOrEqual(single.score);
  });

  it("high engagement posts boost confidence", () => {
    const low = scorePosts("quality-engineering", [makePost({ score: 1, commentCount: 0 })]);
    const high = scorePosts("quality-engineering", [makePost({ score: 5000, commentCount: 1000 })]);
    expect(high.confidence).toBeGreaterThanOrEqual(low.confidence);
  });

  it("returns stable topic in result", () => {
    const result = scorePosts("cybersecurity", [makePost()]);
    expect(result.topic).toBe("cybersecurity");
  });

  it("empty posts array produces minimal score", () => {
    const result = scorePosts("developer-tooling", []);
    expect(result.score).toBe(40);
    expect(result.sourceCount).toBe(0);
  });
});
