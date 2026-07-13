import { NextRequest, NextResponse } from "next/server";
import { detectSignalsJob } from "@/lib/jobs/detect-signals";
import { requireCronSecret } from "@/lib/utils/cron-auth";

export async function POST(req: NextRequest) {
  const denied = requireCronSecret(req);
  if (denied) return denied;
  try {
    return NextResponse.json(await detectSignalsJob());
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
