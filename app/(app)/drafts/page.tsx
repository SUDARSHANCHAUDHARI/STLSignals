import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DraftActionButtons } from "@/components/drafts/draft-action-buttons";
import { getDrafts } from "@/lib/data/repository";

export default async function DraftsPage() {
  const drafts = await getDrafts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Drafts</h1>
        <p className="text-sm text-muted-foreground">Human-reviewed drafts can be approved, published, or exported as Markdown.</p>
      </div>

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
              <textarea
                className="min-h-64 w-full rounded-md border border-input bg-background p-3 font-mono text-sm leading-6"
                defaultValue={draft.contentMarkdown}
                aria-label={`${draft.title} Markdown content`}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <DraftActionButtons draft={draft} />
                <Link
                  href={`/blog/${draft.slug}`}
                  className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Preview public page
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
