import { NextRequest, NextResponse } from "next/server";
import { fetchRedditPostsJob } from "@/lib/jobs/fetch-reddit-posts";
import { requireCronSecret } from "@/lib/utils/cron-auth";

export async function POST(req: NextRequest) {
  const denied = requireCronSecret(req);
  if (denied) return denied;
  try {
    return NextResponse.json(await fetchRedditPostsJob());
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
