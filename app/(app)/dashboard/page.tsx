import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardMetrics, getSignals } from "@/lib/data/repository";

export default async function DashboardPage() {
  const [metrics, signals] = await Promise.all([getDashboardMetrics(), getSignals()]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Sudarshan Tech Labs</p>
        <h1 className="text-3xl font-semibold tracking-normal">Trend discovery cockpit</h1>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Signals", metrics.signals],
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
