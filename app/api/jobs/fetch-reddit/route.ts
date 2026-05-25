import { NextRequest, NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/jobs/auth";
import { fetchRedditPostsJob } from "@/lib/jobs/fetch-reddit-posts";

export async function POST(request: NextRequest) {
  try {
    assertCronAuthorized(request);
    return NextResponse.json(await fetchRedditPostsJob());
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
