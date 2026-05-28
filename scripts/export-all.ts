/**
 * export-all.ts
 * Batch-export every approved or published draft to posts/[slug].md
 *
 * Usage: pnpm export:all
 */

import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const drafts = await prisma.draft.findMany({
    where: { status: { in: ["approved", "published"] } },
    orderBy: { updatedAt: "desc" }
  });

  if (drafts.length === 0) {
    console.log("No approved or published drafts to export.");
    return;
  }

  const dir = path.join(process.cwd(), "posts");
  await fs.mkdir(dir, { recursive: true });

  let written = 0;
  let skipped = 0;

  for (const draft of drafts) {
    const tags = (() => {
      try {
        return JSON.parse(draft.tags) as string[];
      } catch {
        return [];
      }
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
    const filePath = path.join(dir, `${draft.slug}.md`);

    try {
      await fs.writeFile(filePath, content, "utf-8");
      console.log(`  ✓ posts/${draft.slug}.md`);
      written++;
    } catch (err) {
      console.error(`  ✗ posts/${draft.slug}.md — ${String(err)}`);
      skipped++;
    }
  }

  console.log(`\nDone: ${written} written, ${skipped} failed.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
