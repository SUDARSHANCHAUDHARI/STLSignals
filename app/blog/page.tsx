import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublishedDrafts } from "@/lib/data/repository";

export const metadata = {
  title: "STL Signals Blog",
  description: "Original engineering analysis from public trend signals."
};

export default async function BlogIndexPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; topic?: string }>;
}) {
  const { q, topic } = await searchParams;
  const allPosts = await getPublishedDrafts();

  const posts = allPosts.filter((post) => {
    if (topic && !post.tags.some((t) => t.toLowerCase() === topic.toLowerCase())) return false;
    if (q) {
      const needle = q.toLowerCase();
      if (!post.title.toLowerCase().includes(needle) && !post.excerpt.toLowerCase().includes(needle)) return false;
    }
    return true;
  });

  const allTopics = [...new Set(allPosts.flatMap((p) => p.tags))].sort();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Sudarshan Tech Labs</p>
        <h1 className="text-4xl font-semibold tracking-normal">STL Signals Blog</h1>
      </div>

      <form method="GET" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search posts…"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary sm:w-64"
        />
        <select
          name="topic"
          defaultValue={topic ?? ""}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All topics</option>
          {allTopics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Filter
        </button>
        {(q || topic) && (
          <Link href="/blog" className="text-sm text-muted-foreground underline">
            Clear
          </Link>
        )}
      </form>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts match your filter.</p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="transition hover:border-primary/60">
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2">
                  {post.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  <span className="ml-auto text-xs text-muted-foreground">Signals observed from public Reddit discussions</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
