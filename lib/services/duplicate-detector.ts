import { createAiProvider } from "@/lib/ai/provider";
import { prisma } from "@/lib/data/prisma";

const SIMILARITY_THRESHOLD = 0.88;
const useMockMode = process.env.MOCK_MODE !== "false";

export async function isDuplicateSignal(
  candidateSignalId: string,
  candidateText: string
): Promise<{ isDuplicate: boolean; similarSignalId?: string; similarity?: number }> {
  if (useMockMode) {
    return { isDuplicate: false };
  }

  const provider = createAiProvider();
  const candidateEmbedding = await provider.getEmbedding(candidateText);

  // Save the candidate's embedding
  await prisma.signalAnalytics.upsert({
    where: { signalId: candidateSignalId },
    update: { embedding: candidateEmbedding },
    create: {
      signalId: candidateSignalId,
      embedding: candidateEmbedding,
      score: 0,
      confidence: 0
    }
  });

  // Compare against all other stored embeddings
  const others = await prisma.signalAnalytics.findMany({
    where: { signalId: { not: candidateSignalId } }
  });

  for (const other of others) {
    if (!other.embedding) continue;
    const otherVector = other.embedding as number[];
    const similarity = cosineSimilarity(candidateEmbedding, otherVector);
    if (similarity >= SIMILARITY_THRESHOLD) {
      return { isDuplicate: true, similarSignalId: other.signalId, similarity };
    }
  }

  return { isDuplicate: false };
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  const dot = a.reduce((sum, ai, i) => sum + ai * (b[i] ?? 0), 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}
