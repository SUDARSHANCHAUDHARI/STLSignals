import type { MetadataRoute } from "next";
import { getPublishedDrafts } from "@/lib/data/repository";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stlsignals.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const drafts = await getPublishedDrafts();

  const blogEntries: MetadataRoute.Sitemap = drafts.map((draft) => ({
    url: `${BASE_URL}/blog/${draft.slug}`,
    lastModified: new Date(draft.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...blogEntries
  ];
}
