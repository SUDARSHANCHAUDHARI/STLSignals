import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineTrigger } from "@/components/settings/pipeline-trigger";
import { getDashboardMetrics, getSources } from "@/lib/data/repository";

const SAFETY_RULES = [
  "No Reddit auto-posting or auto-commenting",
  "Store metadata and short snippets only (≤280 chars)",
  "Require editorial approval before publishing",
  "SHA-256 author hashing — no usernames stored",
  "Do not imply Reddit endorsement"
];

function envStatus(key: string) {
  return process.env[key] ? "set" : "missing";
}

export default async function SettingsPage() {
  const [metrics, sources] = await Promise.all([getDashboardMetrics(), getSources()]);

  const envVars = [
    { key: "DATABASE_URL", label: "Database" },
    { key: "REDDIT_CLIENT_ID", label: "Reddit OAuth" },
    { key: "GHOST_URL", label: "Ghost CMS" },
    { key: "GHOST_ADMIN_KEY", label: "Ghost API key" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Settings</h1>
        <p className="text-sm text-muted-foreground">Pipeline controls, environment status, and safety rules.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>Fetch Reddit posts and detect signals without leaving the browser.</CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineTrigger />
          </CardContent>
        </Card>

        {/* DB Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Database</CardTitle>
            <CardDescription>Current counts from local SQLite.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Signals", value: metrics.signals },
                { label: "Drafts", value: metrics.drafts },
                { label: "Published", value: metrics.published },
                { label: "Active sources", value: metrics.monitoredSources }
              ].map(({ label, value }) => (
                <div key={label} className="rounded-md border border-border bg-muted/30 p-3 text-center">
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Environment */}
        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Edit .env to configure. Never commit credentials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {envVars.map(({ key, label }) => {
              const status = envStatus(key);
              return (
                <div key={key} className="flex items-center justify-between rounded-md border border-border p-3">
                  <span className="text-sm">{label}</span>
                  <Badge variant={status === "set" ? "success" : "secondary"}>{status}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Monitored sources</CardTitle>
            <CardDescription>Manage full list in <a href="/sources" className="underline">Sources</a>.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sources.length === 0 && (
              <p className="text-sm text-muted-foreground">No sources configured yet.</p>
            )}
            {sources.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">r/{s.subreddit} · {s.scanFrequency}</p>
                </div>
                <Badge variant={s.enabled ? "success" : "secondary"}>{s.enabled ? "active" : "paused"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Safety */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Safety rules</CardTitle>
            <CardDescription>These are enforced in code and cannot be disabled from the UI.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SAFETY_RULES.map((rule) => (
                <div key={rule} className="flex items-center gap-2 rounded-md border border-border p-3 text-sm">
                  <ShieldCheck className="size-4 shrink-0 text-primary" />
                  {rule}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
