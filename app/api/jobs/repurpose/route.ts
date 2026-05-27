export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/jobs/auth";
import { repurposeContentJob } from "@/lib/jobs/repurpose-content";

export async function POST(request: NextRequest) {
  try {
    assertCronAuthorized(request);
    const body = (await request.json().catch(() => ({}))) as { draftId?: string };
    return NextResponse.json(await repurposeContentJob(body.draftId));
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
