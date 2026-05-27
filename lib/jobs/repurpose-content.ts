import { getDrafts } from "@/lib/data/repository";
import { repurposeDraft } from "@/lib/services/repurpose";
import { createJobLogger } from "@/lib/utils/logger";

export async function repurposeContentJob(draftId?: string) {
  const logger = createJobLogger("repurpose-content");
  const allDrafts = await getDrafts();
  const targets = draftId
    ? allDrafts.filter((d) => d.id === draftId)
    : allDrafts.filter((d) => d.status === "approved" || d.status === "published");

  logger.info("starting", { targetCount: targets.length, draftId });

  if (targets.length === 0) {
    logger.info("no eligible drafts");
    return { ok: true, processed: 0 };
  }

  const results: Array<{ draftId: string; platformCount: number; error?: string }> = [];

  for (const draft of targets) {
    try {
      const platforms = await repurposeDraft(draft);
      results.push({ draftId: draft.id, platformCount: platforms.length });
    } catch (err) {
      logger.error("repurpose failed", { draftId: draft.id, error: String(err) });
      results.push({ draftId: draft.id, platformCount: 0, error: String(err) });
    }
  }

  logger.done("complete", { processed: results.length });
  return { ok: true, processed: results.length, results };
}
