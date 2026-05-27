import type { Metadata } from "next";
import { notFound } from "next/navigation";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { getDraftBySlug, getPublishedDrafts } from "@/lib/data/repository";

export async function generateStaticParams() {
  const drafts = await getPublishedDrafts();
  return drafts.map((draft) => ({ slug: draft.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const draft = await getDraftBySlug(slug);
  if (!draft) {
    return {};
  }

  return {
    title: draft.seoTitle,
    description: draft.seoDescription
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const draft = await getDraftBySlug(slug);

  if (!draft) {
    notFound();
  }

  const html = await renderMarkdown(draft.contentMarkdown);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <article className="prose prose-invert prose-neutral max-w-none">
        <p className="text-sm text-muted-foreground">Signals observed from public Reddit discussions</p>
        <h1>{draft.title}</h1>
        <p className="lead">{draft.excerpt}</p>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </main>
  );
}

async function renderMarkdown(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(markdown);
  return String(result);
}
