import { NextResponse } from "next/server";
import { detectSignalsJob } from "@/lib/jobs/detect-signals";

export async function POST() {
  try {
    return NextResponse.json(await detectSignalsJob());
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
