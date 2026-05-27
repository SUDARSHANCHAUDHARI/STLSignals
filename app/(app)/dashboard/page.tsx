import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardMetrics, getSignals } from "@/lib/data/repository";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function velocity(signals: Awaited<ReturnType<typeof getSignals>>) {
  const now = Date.now();
  const last7 = signals.filter((s) => now - new Date(s.createdAt).getTime() < 7 * ONE_DAY_MS).length;
  const prev7 = signals.filter((s) => {
    const age = now - new Date(s.createdAt).getTime();
    return age >= 7 * ONE_DAY_MS && age < 14 * ONE_DAY_MS;
  }).length;
  if (prev7 === 0) return null;
  return Math.round(((last7 - prev7) / prev7) * 100);
}

export default async function DashboardPage() {
  const [metrics, signals] = await Promise.all([getDashboardMetrics(), getSignals()]);
  const vel = velocity(signals);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Sudarshan Tech Labs</p>
        <h1 className="text-3xl font-semibold tracking-normal">Trend discovery cockpit</h1>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Signals</CardDescription>
            <CardTitle className="flex items-end gap-2 text-3xl">
              {metrics.signals}
              {vel !== null && (
                <span className={`mb-1 flex items-center gap-1 text-sm font-normal ${vel >= 0 ? "text-green-500" : "text-red-400"}`}>
                  <TrendingUp className="size-3" />
                  {vel >= 0 ? "+" : ""}{vel}%
                </span>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        {[
          ["Drafts", metrics.drafts],
          ["Published", metrics.published],
          ["Live Sources", metrics.monitoredSources]
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-3xl">{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Collected Reddit Signals</CardTitle>
          <CardDescription>Metadata-led trend signals ready for review and drafting.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Signal</TableHead>
                <TableHead>Topic Score</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signals.map((signal) => (
                <TableRow key={signal.id}>
                  <TableCell>
                    <Link href="/signals" className="font-medium hover:underline">
                      {signal.title}
                    </Link>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{signal.summary}</p>
                  </TableCell>
                  <TableCell>{signal.score}</TableCell>
                  <TableCell>r/{signal.posts[0]?.subreddit ?? "unknown"}</TableCell>
                  <TableCell>{signal.sourceCount}</TableCell>
                  <TableCell>{signal.posts.reduce((total, post) => total + post.score + post.commentCount, 0)}</TableCell>
                  <TableCell>
                    <Badge variant={signal.status === "new" ? "warning" : "secondary"}>{signal.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
