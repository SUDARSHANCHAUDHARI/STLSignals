import { createAiProvider } from "@/lib/ai/provider";
import { prisma } from "@/lib/data/prisma";
import type { ResearchPacket, Signal } from "@/lib/data/types";

const useMockMode = process.env.MOCK_MODE !== "false";

export async function generateAndSaveResearchPacket(signal: Signal): Promise<ResearchPacket> {
  const provider = createAiProvider();
  const packet = await provider.generateResearchPacket(signal);

  if (!useMockMode) {
    await prisma.signal.update({
      where: { id: signal.id },
      data: { researchPacket: packet as Parameters<typeof prisma.signal.update>[0]["data"]["researchPacket"] }
    });
  }

  return packet;
}

export async function getOrGenerateResearchPacket(signal: Signal): Promise<ResearchPacket> {
  if (signal.researchPacket) {
    return signal.researchPacket;
  }
  return generateAndSaveResearchPacket(signal);
}
