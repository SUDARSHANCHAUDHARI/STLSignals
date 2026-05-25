import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublishedDrafts } from "@/lib/data/repository";

export const metadata = {
  title: "STL Signals Blog",
  description: "Original engineering analysis from public trend signals."
};

export default async function BlogIndexPage() {
  const posts = await getPublishedDrafts();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Sudarshan Tech Labs</p>
        <h1 className="text-4xl font-semibold tracking-normal">STL Signals Blog</h1>
      </div>
      <div className="grid gap-4">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <Card className="transition hover:border-primary/60">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Signals observed from public Reddit discussions</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
