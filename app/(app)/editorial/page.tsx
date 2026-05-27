import { ArrowRight, CheckCircle, Clock, FileText, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DraftActionButtons } from "@/components/drafts/draft-action-buttons";
import { getDrafts, getSignals } from "@/lib/data/repository";
import type { DraftStatus } from "@/lib/data/types";

const STATUS_ORDER: DraftStatus[] = ["draft", "reviewing", "approved", "scheduled", "published", "archived", "rejected"];

function statusIcon(status: DraftStatus) {
  if (status === "published") return <CheckCircle className="size-4 text-green-500" />;
  if (status === "approved") return <Zap className="size-4 text-blue-500" />;
  if (status === "reviewing") return <Clock className="size-4 text-yellow-500" />;
  return <FileText className="size-4 text-muted-foreground" />;
}

export default async function EditorialPage() {
  const [drafts, signals] = await Promise.all([getDrafts(), getSignals()]);

  const signalMap = new Map(signals.map((s) => [s.id, s]));

  const grouped = STATUS_ORDER.reduce<Record<string, typeof drafts>>(
    (acc, status) => {
      acc[status] = drafts.filter((d) => d.status === status);
      return acc;
    },
    {} as Record<string, typeof drafts>
  );

  const activeCols: DraftStatus[] = STATUS_ORDER.filter(
    (s) => s !== "archived" && s !== "rejected" && (grouped[s]?.length ?? 0) > 0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Editorial</h1>
        <p className="text-sm text-muted-foreground">Full workflow view — signals to published briefs.</p>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {STATUS_ORDER.filter((s) => s !== "archived" && s !== "rejected").map((s, i, arr) => (
          <span key={s} className="flex items-center gap-2">
            <span className={drafts.some((d) => d.status === s) ? "font-medium text-foreground" : ""}>{s}</span>
            {i < arr.length - 1 && <ArrowRight className="size-3" />}
          </span>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {activeCols.map((status) => (
          <div key={status} className="space-y-3">
            <div className="flex items-center gap-2">
              {statusIcon(status)}
              <h2 className="text-sm font-medium capitalize">{status}</h2>
              <Badge variant="muted">{grouped[status]?.length ?? 0}</Badge>
            </div>

            {(grouped[status] ?? []).map((draft) => {
              const signal = signalMap.get(draft.signalId);
              return (
                <Card key={draft.id} className="text-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{draft.title}</CardTitle>
                    {signal && <CardDescription>{signal.topic}</CardDescription>}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">{draft.excerpt}</p>
                    {draft.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {draft.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="muted" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <DraftActionButtons draft={draft} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))}
      </div>

      {drafts.filter((d) => d.status === "rejected" || d.status === "archived").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Archived / Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {drafts
                .filter((d) => d.status === "rejected" || d.status === "archived")
                .map((draft) => (
                  <div key={draft.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{draft.title}</span>
                    <Badge variant="outline">{draft.status}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
