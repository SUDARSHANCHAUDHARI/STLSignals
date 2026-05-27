import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") ?? "STL Signals";
  const excerpt = searchParams.get("excerpt") ?? "Engineering trend briefs from community signals.";
  const topic = searchParams.get("topic") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: "#0f1117",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#7c6cfc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18
            }}
          >
            ✦
          </div>
          <span style={{ color: "#8a8fa8", fontSize: 18 }}>STL Signals</span>
          {topic && (
            <span
              style={{
                marginLeft: 8,
                background: "#1a1d27",
                border: "1px solid #2d3148",
                borderRadius: 6,
                padding: "2px 10px",
                color: "#7c6cfc",
                fontSize: 14
              }}
            >
              {topic}
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ color: "#e8e9f0", fontSize: 44, fontWeight: 700, lineHeight: 1.2, maxWidth: 900 }}>
            {title.length > 80 ? title.slice(0, 80) + "…" : title}
          </div>
          <div style={{ color: "#8a8fa8", fontSize: 22, lineHeight: 1.5, maxWidth: 820 }}>
            {excerpt.length > 120 ? excerpt.slice(0, 120) + "…" : excerpt}
          </div>
        </div>

        <div style={{ color: "#8a8fa8", fontSize: 15 }}>
          Signals observed from public Reddit discussions · stlsignals.dev
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
