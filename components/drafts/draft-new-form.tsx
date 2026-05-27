"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { createDraft } from "@/lib/actions/draft-actions";

type ClaudeJson = {
  title?: string;
  slug?: string;
  excerpt?: string;
  contentMarkdown?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  faqs?: Array<{ question: string; answer: string }>;
};

interface Props {
  signalId: string;
  signalTitle: string;
}

export function DraftNewForm({ signalId, signalTitle }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // JSON import panel
  const [jsonRaw, setJsonRaw] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [tags, setTags] = useState("");
  const [faqs, setFaqs] = useState("");

  function handleImport() {
    setParseError(null);
    try {
      const data = JSON.parse(jsonRaw) as ClaudeJson;
      if (data.title) setTitle(data.title);
      if (data.slug) setSlug(data.slug);
      if (data.excerpt) setExcerpt(data.excerpt);
      if (data.contentMarkdown) setContent(data.contentMarkdown);
      if (data.seoTitle) setSeoTitle(data.seoTitle);
      if (data.seoDescription) setSeoDesc(data.seoDescription);
      if (data.tags) setTags(Array.isArray(data.tags) ? data.tags.join(", ") : "");
      if (data.faqs) setFaqs(JSON.stringify(data.faqs, null, 2));
    } catch {
      setParseError("Invalid JSON — paste only the JSON block from Claude, no extra text.");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const fd = new FormData();
    fd.set("signalId", signalId);
    fd.set("title", title);
    fd.set("slug", slug);
    fd.set("excerpt", excerpt);
    fd.set("contentMarkdown", content);
    fd.set("seoTitle", seoTitle);
    fd.set("seoDescription", seoDesc);
    fd.set("tags", tags);
    fd.set("faqs", faqs);
    startTransition(async () => {
      const result = await createDraft(fd);
      if (result.ok) {
        router.push("/drafts");
        router.refresh();
      } else {
        setSubmitError(result.error ?? "Failed to create draft");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Signal context banner */}
      <div className="rounded-md border border-border bg-muted/20 px-4 py-3 text-sm">
        <span className="text-muted-foreground">Signal: </span>
        <span className="font-medium">{signalTitle}</span>
      </div>

      {/* Claude JSON import */}
      <div className="rounded-md border border-primary/30 bg-primary/5 p-4 space-y-3">
        <p className="text-sm font-medium">Import from Claude</p>
        <p className="text-xs text-muted-foreground">
          Paste the JSON block from Claude Code terminal — fields will auto-fill below.
        </p>
        <textarea
          value={jsonRaw}
          onChange={(e) => setJsonRaw(e.target.value)}
          placeholder={'{"title": "...", "slug": "...", "contentMarkdown": "..."}'}
          rows={5}
          className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {parseError && <p className="text-xs text-destructive">{parseError}</p>}
        <button
          type="button"
          onClick={handleImport}
          disabled={!jsonRaw.trim()}
          className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-40"
        >
          Parse &amp; fill fields
        </button>
      </div>

      {/* Manual fields */}
      <div className="grid gap-5">
        <Field label="Title *" value={title} onChange={setTitle} />
        <Field
          label="Slug"
          value={slug}
          onChange={setSlug}
          placeholder="auto-generated from title if blank"
        />
        <Field label="Excerpt *" value={excerpt} onChange={setExcerpt} multiline rows={2} />
        <Field
          label="Content (Markdown) *"
          value={content}
          onChange={setContent}
          multiline
          rows={18}
          mono
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="SEO Title" value={seoTitle} onChange={setSeoTitle} placeholder="defaults to title" />
          <Field
            label="SEO Description"
            value={seoDesc}
            onChange={setSeoDesc}
            placeholder="defaults to excerpt"
          />
        </div>
        <Field
          label="Tags (comma-separated)"
          value={tags}
          onChange={setTags}
          placeholder="engineering, testing, ai"
        />
      </div>

      {submitError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
        >
          {isPending ? "Saving…" : "Save draft"}
        </button>
        <Link
          href={"/signals" as Route}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  rows,
  mono
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  mono?: boolean;
}) {
  const cls = `w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary${mono ? " font-mono leading-6" : ""}`;
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows ?? 4}
          className={cls}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}
