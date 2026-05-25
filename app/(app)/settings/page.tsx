import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Settings</h1>
        <p className="text-sm text-muted-foreground">Credentials, publishing rules, and generation safety controls.</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Credentials</CardTitle>
            <CardDescription>Use environment-backed secrets in production.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Reddit client ID" aria-label="Reddit client ID" />
            <Input placeholder="Reddit client secret" aria-label="Reddit client secret" type="password" />
            <Input placeholder="AI provider API key" aria-label="AI provider API key" type="password" />
            <Button type="button">Save settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety Settings</CardTitle>
            <CardDescription>Manual review is required before any draft appears as published content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "No Reddit auto-posting",
              "Store metadata and short snippets only",
              "Require editorial approval",
              "Include public-discussion attribution",
              "Do not imply Reddit endorsement"
            ].map((rule) => (
              <div key={rule} className="flex items-center justify-between rounded-md border border-border p-3">
                <span className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="size-4 text-primary" />
                  {rule}
                </span>
                <Badge variant="success">on</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
