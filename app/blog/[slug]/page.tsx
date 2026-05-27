import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 3600;
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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stlsignals.dev";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const draft = await getDraftBySlug(slug);
  if (!draft) {
    return {};
  }

  const url = `${BASE_URL}/blog/${draft.slug}`;

  return {
    title: draft.seoTitle,
    description: draft.seoDescription,
    keywords: draft.tags,
    openGraph: {
      type: "article",
      url,
      title: draft.seoTitle,
      description: draft.seoDescription,
      publishedTime: draft.publishedAt ?? draft.createdAt,
      modifiedTime: draft.updatedAt,
      tags: draft.tags,
      images: []
    },
    twitter: {
      card: "summary_large_image",
      title: draft.seoTitle,
      description: draft.seoDescription
    },
    alternates: {
      canonical: url
    }
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
