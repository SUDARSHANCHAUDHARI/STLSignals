import { SignalTrendLine, type TrendDataPoint } from "@/components/charts/SignalTrendLine";
import { TopicBarChart, type TopicDataPoint } from "@/components/charts/TopicBarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetrics, getDrafts, getSignals } from "@/lib/data/repository";

function buildTrendData(signals: Awaited<ReturnType<typeof getSignals>>): TrendDataPoint[] {
  const counts = new Map<string, number>();
  for (const signal of signals) {
    const day = signal.createdAt.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, count]) => ({ date: date.slice(5), count }));
}

function buildTopicData(signals: Awaited<ReturnType<typeof getSignals>>): TopicDataPoint[] {
  const counts = new Map<string, number>();
  for (const signal of signals) {
    counts.set(signal.topic, (counts.get(signal.topic) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([topic, count]) => ({ topic: topic.replace(/-/g, " "), count }));
}

export default async function AnalyticsPage() {
  const [signals, drafts, metrics] = await Promise.all([getSignals(), getDrafts(), getDashboardMetrics()]);

  const trendData = buildTrendData(signals);
  const topicData = buildTopicData(signals);

  const publishedCount = drafts.filter((d) => d.status === "published").length;
  const approvedCount = drafts.filter((d) => d.status === "approved").length;
  const avgScore = signals.length > 0 ? (signals.reduce((sum, s) => sum + s.score, 0) / signals.length).toFixed(1) : "—";
  const conversionRate =
    signals.length > 0 ? ((drafts.length / signals.length) * 100).toFixed(0) + "%" : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Analytics</h1>
        <p className="text-sm text-muted-foreground">Signal velocity, topic distribution, and publishing funnel.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Total Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{metrics.signals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Avg Signal Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{avgScore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Signal → Draft Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{conversionRate}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Published / Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {publishedCount}
              <span className="ml-1 text-lg text-muted-foreground">/ {approvedCount}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Signal Velocity (last 14 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <SignalTrendLine data={trendData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signals by Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <TopicBarChart data={topicData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Publishing Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Signals detected", value: metrics.signals },
              { label: "Drafts generated", value: metrics.drafts },
              { label: "Approved", value: approvedCount },
              { label: "Published", value: publishedCount }
            ].map((row, i) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-4 text-xs text-muted-foreground">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span>{row.label}</span>
                    <span className="font-medium">{row.value}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: metrics.signals > 0 ? `${(row.value / metrics.signals) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
