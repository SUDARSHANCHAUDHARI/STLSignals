import Link from "next/link";
import type { Route } from "next";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { DraftActionButtons } from "@/components/drafts/draft-action-buttons";
import { DraftEditPanel } from "@/components/drafts/draft-edit-panel";
import { getDraftsPaginated } from "@/lib/data/repository";

export default async function DraftsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const result = await getDraftsPaginated(page, 10);
  const drafts = result.items;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Drafts</h1>
        <p className="text-sm text-muted-foreground">Human-reviewed drafts can be approved, published, or exported as Markdown.</p>
      </div>

      {drafts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <FileText className="mb-3 size-10 text-muted-foreground/40" />
          <p className="font-medium">No drafts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a signal, copy the Claude prompt, and paste the output to create your first draft.
          </p>
          <Link
            href={"/signals" as Route}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Browse signals →
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {drafts.map((draft) => (
          <Card key={draft.id}>
            <CardHeader>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <CardTitle>{draft.title}</CardTitle>
                  <CardDescription>{draft.excerpt}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">v{draft.version}</span>
                  <Badge variant={draft.status === "approved" ? "success" : "secondary"}>{draft.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <DraftEditPanel
                draftId={draft.id}
                initialContent={draft.contentMarkdown}
                ariaLabel={`${draft.title} Markdown content`}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <DraftActionButtons draft={draft} />
                <Link
                  href={`/blog/${draft.slug}` as Route}
                  className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Preview public page
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {result.totalPages > 1 && (
        <Pagination page={result.page} totalPages={result.totalPages} buildHref={(p) => `/drafts?page=${p}`} />
      )}
    </div>
  );
}
