import { Plus, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
        <Button>
          <Plus className="size-4" />
          Add source
        </Button>
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
          <CardTitle>Add or Edit Source</CardTitle>
          <CardDescription>Form wiring is ready for a server action once persistence is enabled.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-5">
            <Input placeholder="Source name" aria-label="Source name" />
            <Input placeholder="Subreddit" aria-label="Subreddit" />
            <Input className="md:col-span-2" placeholder="keywords, comma separated" aria-label="Keywords" />
            <Button type="button" variant="secondary">
              <Save className="size-4" />
              Save
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
