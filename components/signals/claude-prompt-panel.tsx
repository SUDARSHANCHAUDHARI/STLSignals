"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClaudePromptPanel({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Claude Prompt</p>
          <p className="text-xs text-muted-foreground">
            Copy → paste into Claude Code terminal → paste JSON output into /drafts/new
          </p>
        </div>
        <Button variant="secondary" onClick={handleCopy} className="shrink-0">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied!" : "Copy prompt"}
        </Button>
      </div>
      <pre className="max-h-56 overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs leading-5 whitespace-pre-wrap">
        {prompt}
      </pre>
    </div>
  );
}
