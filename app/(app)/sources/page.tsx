import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SourceForm } from "@/components/sources/source-form";
import { getSources } from "@/lib/data/repository";

export default async function SourcesPage() {
  const sources = await getSources();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Sources</h1>
          <p className="text-sm text-muted-foreground">Configure monitored subreddits, keywords, and scan cadence.</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Plus className="size-3" />
          Add via form below
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monitored Subreddits</CardTitle>
          <CardDescription>Reddit is used only as a public signal source for metadata and short snippets.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subreddit</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell>r/{source.subreddit}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {source.keywords.map((keyword) => (
                        <Badge key={keyword} variant="muted">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{source.scanFrequency}</TableCell>
                  <TableCell>
                    <Badge variant={source.enabled ? "success" : "outline"}>
                      {source.enabled ? "enabled" : "disabled"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Source</CardTitle>
          <CardDescription>Adds a new monitored subreddit. Requires live persistence mode.</CardDescription>
        </CardHeader>
        <CardContent>
          <SourceForm />
        </CardContent>
      </Card>
    </div>
  );
}
