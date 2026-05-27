import { createAiProvider } from "@/lib/ai/provider";
import { prisma } from "@/lib/data/prisma";
import { getSignal } from "@/lib/data/repository";

const useMockMode = process.env.MOCK_MODE !== "false";

export async function generateDraftJob(signalId = "sig-flaky-tests") {
  const signal = await getSignal(signalId);
  if (!signal) {
    throw new Error(`Signal not found: ${signalId}`);
  }

  const provider = createAiProvider();
  const draft = await provider.generateDraft(signal);

  if (!useMockMode) {
    const saved = await prisma.draft.upsert({
      where: { slug: draft.slug },
      update: {
        title: draft.title,
        excerpt: draft.excerpt,
        contentMarkdown: draft.contentMarkdown,
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
        tags: draft.socialSuggestions.slice(0, 5),
        version: { increment: 1 }
      },
      create: {
        signalId: signal.id,
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt,
        contentMarkdown: draft.contentMarkdown,
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
        tags: draft.socialSuggestions.slice(0, 5),
        status: "draft"
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "draft_generated",
        entityType: "draft",
        entityId: saved.id,
        metadata: {
          signalId: signal.id,
          signalTitle: signal.title,
          draftSlug: saved.slug
        }
      }
    });
  }

  return { ok: true, draft, manualReviewRequired: true };
}
