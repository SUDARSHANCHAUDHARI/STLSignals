import { NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/jobs/auth";
import { generateResearchPacketJob } from "@/lib/jobs/generate-research-packet";

export async function POST(request: NextRequest) {
  try {
    assertCronAuthorized(request);
    const body = (await request.json().catch(() => ({}))) as { signalId?: string };
    return NextResponse.json(await generateResearchPacketJob(body.signalId));
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
