import Link from "next/link";
import type { Route } from "next";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { getSignalsPaginated, searchSignals, getSignalsByStatus } from "@/lib/data/repository";

const PAGE_SIZE = 15;

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "New", value: "new" },
  { label: "Draft created", value: "draft_created" },
  { label: "Ignored", value: "ignored" }
] as const;

export default async function SignalsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}) {
  const { page: pageParam, q, status } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  const result =
    q
      ? { items: await searchSignals(q), total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 1 }
      : status
      ? { items: await getSignalsByStatus(status), total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 1 }
      : await getSignalsPaginated(page, PAGE_SIZE);

  const activeStatus = status ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Signals</h1>
          <p className="text-sm text-muted-foreground">Detected trends with source metadata, AI summary, and blog angle.</p>
        </div>
        <form method="GET" className="flex items-center gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search signals…"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
            Search
          </button>
          {q && (
            <Link href={"/signals" as Route} className="text-sm text-muted-foreground underline">
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Status filter tabs */}
      {!q && (
        <div className="flex gap-1 border-b border-border pb-1">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={tab.value ? (`/signals?status=${tab.value}` as Route) : ("/signals" as Route)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                activeStatus === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {result.items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <BarChart3 className="mb-3 size-10 text-muted-foreground/40" />
          <p className="font-medium">
            {q ? `No signals matching "${q}"` : status ? `No ${status.replace("_", " ")} signals` : "No signals yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {q || status
              ? "Try a different search or filter."
              : "Add Reddit sources then run the pipeline to discover trending topics."}
          </p>
          {!q && !status && (
            <Link
              href={"/settings" as Route}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Run pipeline →
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {result.items.map((signal) => (
          <Card key={signal.id}>
            <CardHeader>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <Link href={`/signals/${signal.id}` as Route} className="hover:underline">
                    <CardTitle>{signal.title}</CardTitle>
                  </Link>
                  <CardDescription>{signal.topic}</CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={signal.status === "new" ? "warning" : "secondary"}>{signal.status}</Badge>
                  <Link
                    href={`/signals/${signal.id}` as Route}
                    className="rounded-md border border-border px-2 py-1 text-xs font-medium transition hover:bg-accent"
                  >
                    View
                  </Link>
                  <Link
                    href={`/drafts/new?signalId=${signal.id}` as Route}
                    className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                  >
                    Draft
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Summary</p>
                  <p className="mt-1 text-sm leading-6">{signal.summary}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Suggested blog angle</p>
                  <p className="mt-1 text-sm leading-6">{signal.suggestedAngle}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {signal.keywords.map((keyword) => (
                    <Badge key={keyword} variant="muted">{keyword}</Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase text-muted-foreground">Related Reddit metadata</p>
                <div className="mt-3 space-y-3">
                  {signal.posts.map((post) => (
                    <div key={post.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                      <p className="text-sm font-medium">{post.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        r/{post.subreddit} · score {post.score} · comments {post.commentCount}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{post.contentSnippet}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!q && !status && (
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          buildHref={(p) => `/signals?page=${p}`}
        />
      )}
    </div>
  );
}
