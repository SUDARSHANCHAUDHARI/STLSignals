"use client";

import { useState, useTransition } from "react";
import { EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ignoreSignal, deleteSignal } from "@/lib/actions/signal-actions";

interface Props {
  signalId: string;
  status: string;
}

export function SignalActionButtons({ signalId, status }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleIgnore() {
    startTransition(async () => {
      const r = await ignoreSignal(signalId);
      if (!r.ok) setError("Failed to ignore signal");
    });
  }

  function handleDelete() {
    if (!confirm("Delete this signal and all linked posts? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteSignal(signalId);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {status !== "ignored" && (
        <Button variant="outline" onClick={handleIgnore} disabled={isPending}>
          <EyeOff className="size-4" />
          Ignore
        </Button>
      )}
      <Button
        variant="outline"
        onClick={handleDelete}
        disabled={isPending}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-4" />
        Delete
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
