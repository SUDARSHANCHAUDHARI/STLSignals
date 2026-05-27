"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/data/prisma";

const useMockMode = process.env.MOCK_MODE !== "false";

export async function approveDraft(draftId: string) {
  if (useMockMode) {
    return { ok: true, mock: true };
  }

  await prisma.draft.update({
    where: { id: draftId },
    data: { status: "approved" }
  });

  await prisma.auditLog.create({
    data: {
      action: "draft_approved",
      entityType: "draft",
      entityId: draftId,
      metadata: "{}"
    }
  });

  revalidatePath("/drafts");
  return { ok: true };
}

export async function rejectDraft(draftId: string) {
  if (useMockMode) {
    return { ok: true, mock: true };
  }

  await prisma.draft.update({
    where: { id: draftId },
    data: { status: "rejected" }
  });

  await prisma.auditLog.create({
    data: {
      action: "draft_rejected",
      entityType: "draft",
      entityId: draftId,
      metadata: "{}"
    }
  });

  revalidatePath("/drafts");
  return { ok: true };
}
