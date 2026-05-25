import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STL Signals",
  description: "AI-assisted trend discovery and content drafting for Sudarshan Tech Labs."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
