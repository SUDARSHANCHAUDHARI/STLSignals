"use server";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/data/prisma";

const useMockMode = process.env.MOCK_MODE !== "false";

// ── Approve / Reject ──────────────────────────────────────────────────────────

export async function approveDraft(draftId: string) {
  if (useMockMode) return { ok: true, mock: true };

  await prisma.draft.update({ where: { id: draftId }, data: { status: "approved" } });
  await prisma.auditLog.create({
    data: { action: "draft_approved", entityType: "draft", entityId: draftId, metadata: "{}" }
  });

  revalidatePath("/drafts");
  return { ok: true };
}

export async function rejectDraft(draftId: string) {
  if (useMockMode) return { ok: true, mock: true };

  await prisma.draft.update({ where: { id: draftId }, data: { status: "rejected" } });
  await prisma.auditLog.create({
    data: { action: "draft_rejected", entityType: "draft", entityId: draftId, metadata: "{}" }
  });

  revalidatePath("/drafts");
  return { ok: true };
}

// ── Create ────────────────────────────────────────────────────────────────────

export async function createDraft(formData: FormData) {
  if (useMockMode) return { ok: true, mock: true, id: "mock-draft" };

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const slugRaw = (formData.get("slug") as string | null)?.trim() ?? "";
  const excerpt = (formData.get("excerpt") as string | null)?.trim() ?? "";
  const contentMarkdown = (formData.get("contentMarkdown") as string | null)?.trim() ?? "";
  const seoTitle = (formData.get("seoTitle") as string | null)?.trim() ?? "";
  const seoDescription = (formData.get("seoDescription") as string | null)?.trim() ?? "";
  const tagsRaw = (formData.get("tags") as string | null)?.trim() ?? "";
  const faqsRaw = (formData.get("faqs") as string | null)?.trim() ?? "";
  const signalId = (formData.get("signalId") as string | null)?.trim() ?? "";

  if (!title) return { ok: false, error: "Title is required" };
  if (!excerpt) return { ok: false, error: "Excerpt is required" };
  if (!contentMarkdown) return { ok: false, error: "Content is required" };
  if (!signalId) return { ok: false, error: "A signal must be selected" };

  const slug =
    slugRaw ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  try {
    const draft = await prisma.draft.create({
      data: {
        signalId,
        title,
        slug,
        excerpt,
        contentMarkdown,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt.slice(0, 155),
        tags: JSON.stringify(tags),
        faqs: faqsRaw || null
      }
    });

    await prisma.auditLog.create({
      data: { action: "draft_created", entityType: "draft", entityId: draft.id, metadata: "{}" }
    });

    revalidatePath("/drafts");
    return { ok: true, id: draft.id };
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      return { ok: false, error: `Slug "${slug}" already exists — edit the slug field.` };
    }
    return { ok: false, error: "Failed to save draft" };
  }
}

// ── Save to disk ──────────────────────────────────────────────────────────────

export async function saveDraftToFile(draftId: string) {
  if (useMockMode) return { ok: true, mock: true, path: "posts/mock-draft.md" };

  const draft = await prisma.draft.findUnique({ where: { id: draftId } });
  if (!draft) return { ok: false, error: "Draft not found" };

  const tags = (() => {
    try { return JSON.parse(draft.tags) as string[]; } catch { return []; }
  })();

  const date = (draft.publishedAt ?? draft.createdAt).toISOString().slice(0, 10);

  const frontmatter = [
    "---",
    `title: "${draft.title.replace(/"/g, '\\"')}"`,
    `slug: ${draft.slug}`,
    `date: ${date}`,
    `excerpt: "${draft.excerpt.replace(/"/g, '\\"')}"`,
    `tags: [${tags.map((t) => `"${t}"`).join(", ")}]`,
    `status: ${draft.status}`,
    `seoTitle: "${draft.seoTitle.replace(/"/g, '\\"')}"`,
    `seoDescription: "${draft.seoDescription.replace(/"/g, '\\"')}"`,
    "---",
    ""
  ].join("\n");

  const content = `${frontmatter}\n${draft.contentMarkdown}`;
  const dir = path.join(process.cwd(), "posts");
  const filePath = path.join(dir, `${draft.slug}.md`);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, "utf-8");

  return { ok: true, path: `posts/${draft.slug}.md` };
}

// ── Publish to Ghost ──────────────────────────────────────────────────────────

export async function publishToGhost(draftId: string) {
  if (useMockMode) return { ok: true, mock: true };

  const ghostUrl = process.env.GHOST_URL;
  const ghostKey = process.env.GHOST_ADMIN_KEY;

  if (!ghostUrl || !ghostKey) {
    return { ok: false, error: "GHOST_URL and GHOST_ADMIN_KEY must be set in .env" };
  }

  const draft = await prisma.draft.findUnique({ where: { id: draftId } });
  if (!draft) return { ok: false, error: "Draft not found" };

  const tags = (() => {
    try { return (JSON.parse(draft.tags) as string[]).map((name) => ({ name })); }
    catch { return []; }
  })();

  // Ghost Mobiledoc with a markdown card — compatible across Ghost 4.x / 5.x
  const mobiledoc = JSON.stringify({
    version: "0.3.1",
    markups: [],
    atoms: [],
    cards: [["markdown", { markdown: draft.contentMarkdown }]],
    sections: [[10, 0]]
  });

  const token = ghostJwt(ghostKey);

  const res = await fetch(`${ghostUrl}/ghost/api/admin/posts/`, {
    method: "POST",
    headers: {
      Authorization: `Ghost ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      posts: [
        {
          title: draft.title,
          slug: draft.slug,
          custom_excerpt: draft.excerpt,
          mobiledoc,
          status: "draft",
          tags,
          meta_title: draft.seoTitle,
          meta_description: draft.seoDescription
        }
      ]
    })
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: `Ghost API error ${res.status}: ${body.slice(0, 200)}` };
  }

  const result = (await res.json()) as { posts: Array<{ url: string }> };
  const url = result.posts[0]?.url;

  await prisma.draft.update({ where: { id: draftId }, data: { status: "published" } });
  await prisma.auditLog.create({
    data: {
      action: "draft_published_ghost",
      entityType: "draft",
      entityId: draftId,
      metadata: JSON.stringify({ url })
    }
  });

  revalidatePath("/drafts");
  return { ok: true, url };
}

// Ghost Admin API JWT (HS256, no external library needed)
function ghostJwt(key: string): string {
  const [id, secret] = key.split(":");
  if (!id || !secret) throw new Error("GHOST_ADMIN_KEY must be in id:secret format");

  const iat = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "HS256", kid: id, typ: "JWT" }));
  const payload = b64url(JSON.stringify({ iat, exp: iat + 300, aud: "/ghost/api/admin/" }));
  const sig = crypto
    .createHmac("sha256", Buffer.from(secret, "hex"))
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${sig}`;
}

function b64url(str: string): string {
  return Buffer.from(str).toString("base64url");
}
