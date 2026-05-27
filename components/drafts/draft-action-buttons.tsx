"use client";

import { useState } from "react";
import { CheckCircle, Download, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveDraft, rejectDraft } from "@/lib/actions/draft-actions";
import type { Draft } from "@/lib/data/types";

interface Props {
  draft: Draft;
}

export function DraftActionButtons({ draft }: Props) {
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);

  async function handleApprove() {
    setPending("approve");
    await approveDraft(draft.id);
    setPending(null);
  }

  async function handleReject() {
    setPending("reject");
    await rejectDraft(draft.id);
    setPending(null);
  }

  function handleExport() {
    const blob = new Blob([draft.contentMarkdown], { type: "text/markdown; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draft.slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const isApproved = draft.status === "approved" || draft.status === "published";

  return (
    <div className="flex flex-wrap gap-2">
      {!isApproved && (
        <Button variant="secondary" onClick={handleApprove} disabled={pending !== null}>
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
      <Button variant="outline" onClick={handleReject} disabled={pending !== null || draft.status === "rejected"}>
        <XCircle className="size-4" />
        Reject
      </Button>
      <Button variant="outline" onClick={handleExport}>
        <Download className="size-4" />
        Export Markdown
      </Button>
    </div>
  );
}
