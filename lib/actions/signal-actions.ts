"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/data/prisma";

const useMockMode = process.env.MOCK_MODE !== "false";

export async function ignoreSignal(signalId: string) {
  if (useMockMode) return { ok: true, mock: true };

  await prisma.signal.update({ where: { id: signalId }, data: { status: "ignored" } });
  revalidatePath("/signals");
  revalidatePath(`/signals/${signalId}`);
  return { ok: true };
}

export async function deleteSignal(signalId: string) {
  if (useMockMode) return { ok: true, mock: true };

  await prisma.signal.delete({ where: { id: signalId } });
  revalidatePath("/signals");
  redirect("/signals");
}
