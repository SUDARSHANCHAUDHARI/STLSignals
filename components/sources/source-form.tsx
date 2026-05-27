"use client";

import { useRef, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addSource } from "@/lib/actions/source-actions";

export function SourceForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(formData: FormData) {
    setStatus("saving");
    const result = await addSource(formData);
    if (result.ok) {
      formRef.current?.reset();
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setStatus("error");
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-3 md:grid-cols-5">
      <Input name="name" placeholder="Source name" aria-label="Source name" required />
      <Input name="subreddit" placeholder="Subreddit (e.g. webdev)" aria-label="Subreddit" required />
      <Input
        name="keywords"
        className="md:col-span-2"
        placeholder="keywords, comma separated"
        aria-label="Keywords"
        required
      />
      <Button type="submit" variant="secondary" disabled={status === "saving"}>
        <Save className="size-4" />
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved!" : "Save"}
      </Button>
      {status === "error" && <p className="text-sm text-destructive md:col-span-5">Failed to save source.</p>}
    </form>
  );
}
