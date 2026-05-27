import { NextResponse } from "next/server";
import { prisma } from "@/lib/data/prisma";

const useMockMode = process.env.MOCK_MODE !== "false";

export async function GET() {
  const start = Date.now();

  if (useMockMode) {
    return NextResponse.json({ status: "ok", mode: "mock", db: "skipped", latencyMs: 0 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", mode: "live", db: "connected", latencyMs: Date.now() - start });
  } catch (err) {
    return NextResponse.json(
      { status: "error", mode: "live", db: "unreachable", error: String(err) },
      { status: 503 }
    );
  }
}
