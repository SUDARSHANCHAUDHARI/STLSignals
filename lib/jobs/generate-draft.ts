import { createAiProvider } from "@/lib/ai/provider";
import { getSignal } from "@/lib/data/repository";

export async function generateDraftJob(signalId = "sig-flaky-tests") {
  const signal = await getSignal(signalId);
  if (!signal) {
    throw new Error(`Signal not found: ${signalId}`);
  }

  const provider = createAiProvider();
  const draft = await provider.generateDraft(signal);

  // TODO: Persist Draft with status=draft and append AuditLog entry.
  return { ok: true, draft, manualReviewRequired: true };
}
