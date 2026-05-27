import { getDrafts } from "@/lib/data/repository";
import { repurposeDraft } from "@/lib/services/repurpose";

export async function repurposeContentJob(draftId?: string) {
  const allDrafts = await getDrafts();
  const targets = draftId
    ? allDrafts.filter((d) => d.id === draftId)
    : allDrafts.filter((d) => d.status === "approved" || d.status === "published");

  if (targets.length === 0) {
    return { ok: true, processed: 0 };
  }

  const results: Array<{ draftId: string; platformCount: number; error?: string }> = [];

  for (const draft of targets) {
    try {
      const platforms = await repurposeDraft(draft);
      results.push({ draftId: draft.id, platformCount: platforms.length });
    } catch (err) {
      results.push({ draftId: draft.id, platformCount: 0, error: String(err) });
    }
  }

  return { ok: true, processed: results.length, results };
}
