import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stlsignals.dev";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "STL Signals — Engineering Trend Briefs",
    template: "%s | STL Signals"
  },
  description: "Weekly engineering trend signals sourced from community discussion and original analysis.",
  openGraph: {
    type: "website",
    siteName: "STL Signals",
    title: "STL Signals — Engineering Trend Briefs",
    description: "Weekly engineering trend signals sourced from community discussion and original analysis.",
    url: BASE_URL
  },
  twitter: {
    card: "summary_large_image",
    title: "STL Signals — Engineering Trend Briefs",
    description: "Weekly engineering trend signals sourced from community discussion and original analysis."
  },
  alternates: {
    types: {
      "application/rss+xml": `${BASE_URL}/feed.xml`
    }
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
