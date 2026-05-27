import { getSignal, getSignals } from "@/lib/data/repository";
import { generateAndSaveResearchPacket } from "@/lib/services/research-packet";

export async function generateResearchPacketJob(signalId?: string) {
  if (signalId) {
    const signal = await getSignal(signalId);
    if (!signal) throw new Error(`Signal not found: ${signalId}`);

    const packet = await generateAndSaveResearchPacket(signal);
    return { ok: true, processed: 1, signalId, packet };
  }

  // Process all signals that don't have a research packet yet
  const signals = await getSignals();
  const pending = signals.filter((s) => !s.researchPacket && s.status !== "ignored");
  const results = [];

  for (const signal of pending) {
    const packet = await generateAndSaveResearchPacket(signal);
    results.push({ signalId: signal.id, topic: signal.topic, ok: true, packet });
  }

  return { ok: true, processed: results.length, results };
}
