import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

// Job endpoints are expensive (Reddit fetches + LLM calls). Require a shared
// secret so only the scheduler can trigger them. Set CRON_SECRET in the env and
// send it as `Authorization: Bearer <secret>` or `x-cron-secret: <secret>`.
export function requireCronSecret(req: NextRequest): NextResponse | null {
  const expected = process.env.CRON_SECRET || "";
  if (!expected) {
    // Fail closed: without a configured secret the endpoint is disabled.
    return NextResponse.json({ ok: false, error: "Job endpoint disabled" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
  const presented = bearer || req.headers.get("x-cron-secret") || "";

  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
