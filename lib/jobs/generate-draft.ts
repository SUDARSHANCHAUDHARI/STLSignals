import { createAiProvider } from "@/lib/ai/provider";
import { prisma } from "@/lib/data/prisma";
import { getSignal } from "@/lib/data/repository";
import { getOrGenerateResearchPacket } from "@/lib/services/research-packet";
import { createJobLogger } from "@/lib/utils/logger";

const useMockMode = process.env.MOCK_MODE !== "false";

export async function generateDraftJob(signalId = "sig-flaky-tests") {
  const logger = createJobLogger("generate-draft");
  logger.info("starting", { signalId, mode: useMockMode ? "mock" : "live" });

  const signal = await getSignal(signalId);
  if (!signal) {
    logger.error("signal not found", { signalId });
    throw new Error(`Signal not found: ${signalId}`);
  }

  // Ensure research packet exists before generating draft
  const researchPacket = await getOrGenerateResearchPacket(signal);

  const provider = createAiProvider();
  const draft = await provider.generateDraft(signal, researchPacket);

  if (!useMockMode) {
    const saved = await prisma.draft.upsert({
      where: { slug: draft.slug },
      update: {
        title: draft.title,
        excerpt: draft.excerpt,
        contentMarkdown: draft.contentMarkdown,
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
        tags: draft.tags,
        faqs: draft.faqs,
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
        tags: draft.tags,
        faqs: draft.faqs,
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
          draftSlug: saved.slug,
          hadResearchPacket: !!signal.researchPacket
        }
      }
    });
  }

  logger.done("complete", { signalId, slug: draft.slug, tags: draft.tags.length, faqs: draft.faqs.length });
  return { ok: true, draft, manualReviewRequired: true };
}
