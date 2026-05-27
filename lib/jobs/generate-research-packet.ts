import { getSignal, getSignals } from "@/lib/data/repository";
import { generateAndSaveResearchPacket } from "@/lib/services/research-packet";
import { createJobLogger } from "@/lib/utils/logger";

export async function generateResearchPacketJob(signalId?: string) {
  const logger = createJobLogger("generate-research-packet");

  if (signalId) {
    logger.info("starting single", { signalId });
    const signal = await getSignal(signalId);
    if (!signal) {
      logger.error("signal not found", { signalId });
      throw new Error(`Signal not found: ${signalId}`);
    }
    const packet = await generateAndSaveResearchPacket(signal);
    logger.done("complete", { signalId, processed: 1 });
    return { ok: true, processed: 1, signalId, packet };
  }

  const signals = await getSignals();
  const pending = signals.filter((s) => !s.researchPacket && s.status !== "ignored");
  logger.info("starting batch", { pendingCount: pending.length });

  const results = [];
  for (const signal of pending) {
    try {
      const packet = await generateAndSaveResearchPacket(signal);
      results.push({ signalId: signal.id, topic: signal.topic, ok: true, packet });
    } catch (err) {
      logger.error("failed to generate packet", { signalId: signal.id, error: String(err) });
      results.push({ signalId: signal.id, topic: signal.topic, ok: false });
    }
  }

  logger.done("complete", { processed: results.length });
  return { ok: true, processed: results.length, results };
}
