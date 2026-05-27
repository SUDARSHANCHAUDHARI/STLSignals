import { createAiProvider, type PlatformContent, type RepurposeDraftInput } from "@/lib/ai/provider";
import { prisma } from "@/lib/data/prisma";
import type { Draft } from "@/lib/data/types";

const useMockMode = process.env.MOCK_MODE !== "false";

export async function repurposeDraft(draft: Draft): Promise<PlatformContent[]> {
  const input: RepurposeDraftInput = {
    title: draft.title,
    excerpt: draft.excerpt,
    contentMarkdown: draft.contentMarkdown,
    tags: draft.tags
  };

  const provider = createAiProvider();
  const platforms = await provider.repurposeDraft(input);

  if (!useMockMode) {
    for (const item of platforms) {
      await prisma.contentRepurpose.upsert({
        where: { draftId_platform: { draftId: draft.id, platform: item.platform } },
        update: { content: item.content },
        create: { draftId: draft.id, platform: item.platform, content: item.content }
      });
    }
  }

  return platforms;
}
