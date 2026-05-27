import { getPublishedDrafts } from "@/lib/data/repository";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stlsignals.dev";

export async function GET() {
  const drafts = await getPublishedDrafts();

  const items = drafts
    .map(
      (draft) => `
  <item>
    <title><![CDATA[${draft.title}]]></title>
    <link>${BASE_URL}/blog/${draft.slug}</link>
    <guid isPermaLink="true">${BASE_URL}/blog/${draft.slug}</guid>
    <description><![CDATA[${draft.excerpt}]]></description>
    <pubDate>${new Date(draft.publishedAt ?? draft.updatedAt).toUTCString()}</pubDate>
    ${draft.tags.map((tag) => `<category><![CDATA[${tag}]]></category>`).join("\n    ")}
  </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>STL Signals — Engineering Trend Briefs</title>
    <link>${BASE_URL}</link>
    <description>Weekly engineering trend signals sourced from community discussion and original analysis.</description>
    <language>en-us</language>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600"
    }
  });
}
