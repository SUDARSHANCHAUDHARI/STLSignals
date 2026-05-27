export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/jobs/auth";
import { detectSignalsJob } from "@/lib/jobs/detect-signals";

export async function POST(request: NextRequest) {
  try {
    assertCronAuthorized(request);
    return NextResponse.json(await detectSignalsJob());
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
