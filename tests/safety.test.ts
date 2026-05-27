import { describe, it, expect } from "vitest";
import { toSnippet, sourceAttribution } from "../lib/utils/safety";

describe("toSnippet", () => {
  it("returns short text unchanged", () => {
    expect(toSnippet("hello world")).toBe("hello world");
  });

  it("truncates to 280 chars with ellipsis", () => {
    const long = "a".repeat(300);
    const result = toSnippet(long);
    expect(result.length).toBe(280);
    expect(result.endsWith("...")).toBe(true);
  });

  it("normalises whitespace", () => {
    expect(toSnippet("hello   world\n\nfoo")).toBe("hello world foo");
  });

  it("handles empty string", () => {
    expect(toSnippet("")).toBe("");
  });

  it("does not truncate exactly 280 chars", () => {
    const exactly = "a".repeat(280);
    expect(toSnippet(exactly)).toBe(exactly);
  });
});

describe("sourceAttribution", () => {
  it("returns the canonical attribution string", () => {
    expect(sourceAttribution()).toBe("Signals observed from public Reddit discussions");
  });
});
