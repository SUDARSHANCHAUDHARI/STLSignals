import { describe, it, expect } from "vitest";
import { inferTopic, scorePosts } from "../lib/services/signal-scorer";
import type { RawPost } from "../lib/data/types";

function makePost(overrides: Partial<RawPost> = {}): RawPost {
  return {
    id: "post-1",
    sourceId: "src-1",
    externalId: "ext-1",
    title: "Generic engineering post",
    url: "https://reddit.com/r/test/1",
    subreddit: "test",
    authorHash: "abc123",
    score: 100,
    commentCount: 20,
    createdUtc: "2025-01-01T00:00:00Z",
    permalink: "/r/test/1",
    contentSnippet: "short snippet",
    fetchedAt: "2025-01-01T01:00:00Z",
    ...overrides
  };
}

describe("inferTopic", () => {
  it("maps flaky to quality-engineering", () => {
    expect(inferTopic("My flaky tests are killing CI")).toBe("quality-engineering");
  });

  it("maps QA to quality-engineering", () => {
    expect(inferTopic("QA best practices for 2025")).toBe("quality-engineering");
  });

  it("maps security to cybersecurity", () => {
    expect(inferTopic("Exposed secrets in git history")).toBe("cybersecurity");
  });

  it("maps vuln to cybersecurity", () => {
    expect(inferTopic("Critical vuln in popular package")).toBe("cybersecurity");
  });

  it("defaults to developer-tooling", () => {
    expect(inferTopic("Build times are too slow")).toBe("developer-tooling");
  });
});

describe("scorePosts", () => {
  it("returns a ScoredSignal with correct sourceCount", () => {
    const posts = [makePost({ id: "p1" }), makePost({ id: "p2" })];
    const result = scorePosts("developer-tooling", posts);
    expect(result.sourceCount).toBe(2);
  });

  it("score is at least 40", () => {
    const result = scorePosts("developer-tooling", [makePost()]);
    expect(result.score).toBeGreaterThanOrEqual(40);
  });

  it("score is capped at 100", () => {
    const posts = Array.from({ length: 20 }, (_, i) =>
      makePost({ id: `p${i}`, score: 10000, commentCount: 5000 })
    );
    const result = scorePosts("developer-tooling", posts);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("confidence is between 0 and 0.95", () => {
    const result = scorePosts("developer-tooling", [makePost()]);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(0.95);
  });

  it("extracts keywords from post titles", () => {
    const posts = [
      makePost({ id: "p1", title: "typescript tooling getting better" }),
      makePost({ id: "p2", title: "typescript performance improvements" })
    ];
    const result = scorePosts("developer-tooling", posts);
    expect(result.keywords).toContain("typescript");
  });

  it("returns the supplied posts array", () => {
    const posts = [makePost()];
    expect(scorePosts("developer-tooling", posts).posts).toBe(posts);
  });
});
