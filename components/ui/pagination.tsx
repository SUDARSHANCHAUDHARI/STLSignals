import Link from "next/link";
import type { Route } from "next";

interface Props {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function Pagination({ page, totalPages, buildHref }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      {page > 1 && (
        <Link
          href={buildHref(page - 1) as Route}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
        >
          ← Prev
        </Link>
      )}
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={buildHref(page + 1) as Route}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
        >
          Next →
        </Link>
      )}
    </div>
  );
}
