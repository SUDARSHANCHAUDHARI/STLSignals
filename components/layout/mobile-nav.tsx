"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { BarChart3, FileText, Gauge, LayoutList, LineChart, Menu, RadioTower, Settings, Sparkles, X } from "lucide-react";

const navItems: Array<{ href: Route; label: string; icon: typeof Gauge }> = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/sources", label: "Sources", icon: RadioTower },
  { href: "/signals", label: "Signals", icon: BarChart3 },
  { href: "/drafts", label: "Drafts", icon: FileText },
  { href: "/editorial", label: "Editorial", icon: LayoutList },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4" />
          STL Signals
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden />
          <nav className="relative flex w-64 flex-col bg-card p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Sparkles className="size-4" />
                </span>
                STL Signals
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
