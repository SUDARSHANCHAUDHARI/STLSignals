import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <article className="prose prose-invert prose-neutral max-w-none">
        <p className="text-sm text-muted-foreground">Signals observed from public Reddit discussions</p>
        <h1>{draft.title}</h1>
        <p className="lead">{draft.excerpt}</p>
        <MarkdownPreview markdown={draft.contentMarkdown} />
      </article>
    </main>
  );
}

function MarkdownPreview({ markdown }: { markdown: string }) {
  const blocks = markdown.split("\n\n");
  return (
    <>
      {blocks.map((block, index) => {
        if (block.startsWith("# ")) {
          return <h2 key={index}>{block.replace("# ", "")}</h2>;
        }
        if (block.startsWith("## ")) {
          return <h3 key={index}>{block.replace("## ", "")}</h3>;
        }
        if (block.startsWith("- ")) {
          return (
            <ul key={index}>
              {block.split("\n").map((item) => (
                <li key={item}>{item.replace("- ", "")}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{block}</p>;
      })}
    </>
  );
}
