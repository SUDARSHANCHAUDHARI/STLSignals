import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { DraftNewForm } from "@/components/drafts/draft-new-form";
import { getSignal } from "@/lib/data/repository";

export default async function DraftNewPage({
  searchParams
}: {
  searchParams: Promise<{ signalId?: string }>;
}) {
  const { signalId } = await searchParams;

  if (!signalId) {
    redirect("/signals" as Route);
  }

  const signal = await getSignal(signalId);

  if (!signal) {
    redirect("/signals" as Route);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/signals/${signalId}` as Route}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to signal
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-normal">New draft</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste Claude&apos;s JSON output to auto-fill, or type directly into the fields.
        </p>
      </div>

      <DraftNewForm signalId={signal.id} signalTitle={signal.title} />
    </div>
  );
}
