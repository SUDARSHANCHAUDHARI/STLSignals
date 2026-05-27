import { NextResponse } from "next/server";
import { fetchRedditPostsJob } from "@/lib/jobs/fetch-reddit-posts";

export async function POST() {
  try {
    return NextResponse.json(await fetchRedditPostsJob());
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
