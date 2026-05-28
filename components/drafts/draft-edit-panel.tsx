"use client";

import { useState, useTransition } from "react";
import { Check, Save } from "lucide-react";
import { updateDraft } from "@/lib/actions/draft-actions";

interface Props {
  draftId: string;
  initialContent: string;
  ariaLabel: string;
}

function readTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return { words, mins };
}

export function DraftEditPanel({ draftId, initialContent, ariaLabel }: Props) {
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDirty = content !== initialContent;
  const { words, mins } = readTime(content);

  function handleSave() {
    setSaved(false);
    setError(null);
    const fd = new FormData();
    fd.set("contentMarkdown", content);
    startTransition(async () => {
      const result = await updateDraft(draftId, fd);
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error ?? "Save failed");
      }
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setSaved(false); }}
        aria-label={ariaLabel}
        className="min-h-64 w-full rounded-md border border-input bg-background p-3 font-mono text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isPending || !isDirty}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-accent disabled:opacity-40"
        >
          {saved ? <Check className="size-3 text-green-400" /> : <Save className="size-3" />}
          {isPending ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
        <span className="text-xs text-muted-foreground">
          {words.toLocaleString()} words · {mins} min read
        </span>
        {isDirty && !saved && (
          <span className="text-xs text-muted-foreground">· Unsaved changes</span>
        )}
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}
