import Link from "next/link";
import type { Route } from "next";
import { BarChart3, FileText, Gauge, LayoutList, LineChart, RadioTower, Settings, Sparkles } from "lucide-react";

const navItems: Array<{ href: Route; label: string; icon: typeof Gauge }> = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/sources", label: "Sources", icon: RadioTower },
  { href: "/signals", label: "Signals", icon: BarChart3 },
  { href: "/drafts", label: "Drafts", icon: FileText },
  { href: "/editorial", label: "Editorial", icon: LayoutList },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card/60 p-4 backdrop-blur lg:block">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-3 text-sm font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          STL Signals
        </Link>
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4" />
            STL Signals
          </Link>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
