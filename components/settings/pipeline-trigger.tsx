"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = { label: string; route: string };
const STEPS: Step[] = [
  { label: "Fetch Reddit posts", route: "/api/jobs/fetch-reddit" },
  { label: "Detect signals", route: "/api/jobs/detect-signals" }
];

export function PipelineTrigger() {
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setLog([]);

    for (const step of STEPS) {
      setLog((prev) => [...prev, `⏳ ${step.label}…`]);
      try {
        const res = await fetch(step.route, { method: "POST" });
        const data = (await res.json()) as { ok: boolean; signals?: { title: string }[]; results?: unknown[] };
        if (data.ok) {
          const detail =
            step.route.includes("detect") && data.signals
              ? ` (${data.signals.length} signals)`
              : "";
          setLog((prev) => [...prev.slice(0, -1), `✓ ${step.label}${detail}`]);
        } else {
          setLog((prev) => [...prev.slice(0, -1), `✗ ${step.label} — server error`]);
        }
      } catch {
        setLog((prev) => [...prev.slice(0, -1), `✗ ${step.label} — network error`]);
      }
    }

    setLog((prev) => [...prev, "Done. Refresh the Signals page to see results."]);
    setRunning(false);
  }

  return (
    <div className="space-y-3">
      <Button onClick={run} disabled={running} variant="secondary">
        <Play className="size-4" />
        {running ? "Running…" : "Run pipeline now"}
      </Button>
      {log.length > 0 && (
        <pre className="rounded-md border border-border bg-muted/30 p-3 text-xs leading-6">
          {log.join("\n")}
        </pre>
      )}
    </div>
  );
}
