import crypto from "node:crypto";
import { afterEach, describe, it, expect, vi } from "vitest";
import { hashAuthor } from "../lib/reddit/client";

// vitest has no "@/" alias configured; client.ts only needs toSnippet from it.
vi.mock("@/lib/utils/safety", () => ({ toSnippet: (text: string) => text }));

describe("hashAuthor", () => {
  afterEach(() => {
    delete process.env.AUTHOR_HASH_SECRET;
  });

  it("uses a keyed HMAC, not a plain SHA-256 of the username", () => {
    process.env.AUTHOR_HASH_SECRET = "test-secret";
    const plain = `sha256:${crypto.createHash("sha256").update("spez").digest("hex")}`;
    const result = hashAuthor("spez");
    expect(result).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(result).not.toBe(plain);
    expect(hashAuthor("spez")).toBe(result);
  });

  it("stores no author-derived value when the secret is unset", () => {
    expect(hashAuthor("spez")).toBe("");
  });
});
