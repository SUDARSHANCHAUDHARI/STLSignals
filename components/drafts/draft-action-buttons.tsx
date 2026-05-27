"use client";

import { useState } from "react";
import { CheckCircle, Download, HardDrive, Send, XCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveDraft, rejectDraft, saveDraftToFile, publishToGhost } from "@/lib/actions/draft-actions";
import type { Draft } from "@/lib/data/types";

interface Props {
  draft: Draft;
}

export function DraftActionButtons({ draft }: Props) {
  const [pending, setPending] = useState<"approve" | "reject" | "save" | "ghost" | null>(null);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  async function wrap<T extends { ok: boolean; error?: string; path?: string; url?: string }>(
    key: typeof pending,
    fn: () => Promise<T>,
    successMsg: (r: T) => string
  ) {
    setPending(key);
    setFeedback(null);
    try {
      const r = await fn();
      setFeedback({ ok: r.ok, msg: r.ok ? successMsg(r) : (r.error ?? "Failed") });
    } finally {
      setPending(null);
    }
  }

  function handleDownload() {
    const blob = new Blob([buildMarkdown(draft)], { type: "text/markdown; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draft.slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const isApproved = draft.status === "approved" || draft.status === "published";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {!isApproved && (
          <Button variant="secondary" onClick={() => wrap("approve", () => approveDraft(draft.id), () => "Approved")} disabled={pending !== null}>
            <Send className="size-4" />
            {pending === "approve" ? "Approving…" : "Approve"}
          </Button>
        )}
        {isApproved && (
          <Button variant="secondary" disabled className="cursor-default opacity-60">
            <CheckCircle className="size-4" />
            Approved
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => wrap("reject", () => rejectDraft(draft.id), () => "Rejected")}
          disabled={pending !== null || draft.status === "rejected"}
        >
          <XCircle className="size-4" />
          Reject
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="size-4" />
          Download .md
        </Button>
        <Button
          variant="outline"
          onClick={() => wrap("save", () => saveDraftToFile(draft.id), (r) => `Saved to ${r.path}`)}
          disabled={pending !== null}
          title="Write posts/[slug].md to disk"
        >
          <HardDrive className="size-4" />
          {pending === "save" ? "Saving…" : "Save to disk"}
        </Button>
        <Button
          variant="outline"
          onClick={() => wrap("ghost", () => publishToGhost(draft.id), (r) => r.url ? `Published: ${r.url}` : "Sent to Ghost")}
          disabled={pending !== null}
          title="Publish to Ghost CMS (requires GHOST_URL + GHOST_ADMIN_KEY)"
        >
          <Zap className="size-4" />
          {pending === "ghost" ? "Publishing…" : "Ghost CMS"}
        </Button>
      </div>
      {feedback && (
        <p className={`text-xs ${feedback.ok ? "text-green-400" : "text-destructive"}`}>
          {feedback.msg}
        </p>
      )}
    </div>
  );
}

function buildMarkdown(draft: Draft): string {
  const date = (draft.publishedAt ?? draft.createdAt).slice(0, 10);
  const fm = [
    "---",
    `title: "${draft.title.replace(/"/g, '\\"')}"`,
    `slug: ${draft.slug}`,
    `date: ${date}`,
    `excerpt: "${draft.excerpt.replace(/"/g, '\\"')}"`,
    `tags: [${draft.tags.map((t) => `"${t}"`).join(", ")}]`,
    `status: ${draft.status}`,
    `seoTitle: "${draft.seoTitle.replace(/"/g, '\\"')}"`,
    `seoDescription: "${draft.seoDescription.replace(/"/g, '\\"')}"`,
    "---",
    ""
  ].join("\n");
  return `${fm}\n${draft.contentMarkdown}`;
}
