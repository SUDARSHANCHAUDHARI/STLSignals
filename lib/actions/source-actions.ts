"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/data/prisma";

const useMockMode = process.env.MOCK_MODE !== "false";

const SourceInputSchema = z.object({
  name: z.string().min(1).max(100),
  subreddit: z
    .string()
    .min(1)
    .max(50)
    .transform((v) => v.replace(/^r\//, "")),
  keywords: z
    .string()
    .transform((v) =>
      v
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    )
    .pipe(z.array(z.string()).min(1))
});

export async function addSource(formData: FormData) {
  if (useMockMode) {
    return { ok: true, mock: true };
  }

  const parsed = SourceInputSchema.safeParse({
    name: formData.get("name"),
    subreddit: formData.get("subreddit"),
    keywords: formData.get("keywords")
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.source.create({
    data: {
      type: "reddit",
      name: parsed.data.name,
      subreddit: parsed.data.subreddit,
      keywords: JSON.stringify(parsed.data.keywords),
      enabled: true,
      scanFrequency: "daily"
    }
  });

  revalidatePath("/sources");
  return { ok: true };
}

export async function toggleSource(sourceId: string, enabled: boolean) {
  if (useMockMode) {
    return { ok: true, mock: true };
  }

  await prisma.source.update({
    where: { id: sourceId },
    data: { enabled }
  });

  revalidatePath("/sources");
  return { ok: true };
}
