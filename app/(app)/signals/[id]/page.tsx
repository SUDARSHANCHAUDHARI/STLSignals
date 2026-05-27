import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClaudePromptPanel } from "@/components/signals/claude-prompt-panel";
import { getSignal } from "@/lib/data/repository";
import type { Signal } from "@/lib/data/types";

function buildClaudePrompt(signal: Signal): string {
  const posts = signal.posts
    .map(
      (p) =>
        `- "${p.title}" (score: ${p.score}, comments: ${p.commentCount})\n  Snippet: ${p.contentSnippet}`
    )
    .join("\n");

  return `You are a technical content writer for STL Signals.

Write a complete, publish-ready blog post based on the signal below.

Signal title: ${signal.title}
Topic: ${signal.topic}
Keywords: ${signal.keywords.join(", ")}
Summary: ${signal.summary}

Related discussions (public Reddit metadata only):
${posts}

Return ONLY a JSON object — no markdown fence, no explanation:
{
  "title": "engaging post title (10-80 chars)",
  "slug": "url-slug-with-dashes",
  "excerpt": "1-2 sentence summary for card previews (20-200 chars)",
  "contentMarkdown": "full article in GitHub Flavored Markdown (800-2000 words)",
  "seoTitle": "SEO title (10-65 chars)",
  "seoDescription": "meta description (20-155 chars)",
  "tags": ["tag1", "tag2", "tag3"],
  "faqs": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}

Guidelines:
- Audience: senior engineers and tech leads
- Lead with why this matters now
- Practical takeaways in every section
- Do not reference Reddit, specific usernames, or post links
- Synthesise the trend — do not copy any snippet text`;
}

export default async function SignalDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const signal = await getSignal(id);
  if (!signal) notFound();

  const prompt = buildClaudePrompt(signal);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={"/signals" as Route}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Signals
        </Link>
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">{signal.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{signal.topic}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge variant={signal.status === "new" ? "warning" : "secondary"}>{signal.status}</Badge>
          <Link
            href={`/drafts/new?signalId=${signal.id}` as Route}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <PenLine className="size-4" />
            Create draft
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Signal summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Summary</p>
              <p className="mt-1 text-sm leading-6">{signal.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {signal.keywords.map((kw) => (
                <Badge key={kw} variant="muted">{kw}</Badge>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-md border border-border bg-muted/30 p-3 text-center text-xs">
              <div>
                <p className="font-semibold text-lg">{signal.score}</p>
                <p className="text-muted-foreground">Score</p>
              </div>
              <div>
                <p className="font-semibold text-lg">{(signal.confidence * 100).toFixed(0)}%</p>
                <p className="text-muted-foreground">Confidence</p>
              </div>
              <div>
                <p className="font-semibold text-lg">{signal.sourceCount}</p>
                <p className="text-muted-foreground">Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reddit metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {signal.posts.map((post) => (
                <div key={post.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-medium leading-5">{post.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    r/{post.subreddit} · score {post.score} · {post.commentCount} comments
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{post.contentSnippet}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate with Claude</CardTitle>
        </CardHeader>
        <CardContent>
          <ClaudePromptPanel prompt={prompt} />
          <p className="mt-4 text-xs text-muted-foreground">
            After running the prompt, go to{" "}
            <Link href={`/drafts/new?signalId=${signal.id}` as Route} className="underline">
              Create draft
            </Link>{" "}
            and paste the JSON output to auto-fill the form.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
