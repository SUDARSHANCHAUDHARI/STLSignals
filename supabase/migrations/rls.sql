-- STLSignals Row Level Security policies
-- Run against your Supabase project after enabling RLS on each table.
-- Prisma uses the service_role connection string which bypasses RLS — these
-- policies protect direct anon/user client access.

-- Enable RLS
ALTER TABLE "Source"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RawPost"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Signal"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SignalPost"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Draft"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TopicCluster"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContentRepurpose" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SignalAnalytics" ENABLE ROW LEVEL SECURITY;

-- Helper: extract role from JWT user_metadata
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    'viewer'
  );
$$;

-- Viewers and above: read-only on published/approved content
CREATE POLICY "viewer_read_sources" ON "Source"
  FOR SELECT USING (auth.user_role() IN ('viewer','reviewer','editor','admin'));

CREATE POLICY "viewer_read_signals" ON "Signal"
  FOR SELECT USING (auth.user_role() IN ('viewer','reviewer','editor','admin'));

CREATE POLICY "viewer_read_published_drafts" ON "Draft"
  FOR SELECT USING (
    status IN ('published','approved')
    OR auth.user_role() IN ('reviewer','editor','admin')
  );

-- Editors and above: full read on all tables
CREATE POLICY "editor_read_rawposts" ON "RawPost"
  FOR SELECT USING (auth.user_role() IN ('editor','admin'));

CREATE POLICY "editor_read_auditlog" ON "AuditLog"
  FOR SELECT USING (auth.user_role() IN ('editor','admin'));

CREATE POLICY "editor_read_repurpose" ON "ContentRepurpose"
  FOR SELECT USING (auth.user_role() IN ('editor','admin'));

CREATE POLICY "editor_read_analytics" ON "SignalAnalytics"
  FOR SELECT USING (auth.user_role() IN ('editor','admin'));

-- Editors: write drafts and sources
CREATE POLICY "editor_write_drafts" ON "Draft"
  FOR ALL USING (auth.user_role() IN ('editor','admin'));

CREATE POLICY "editor_write_sources" ON "Source"
  FOR ALL USING (auth.user_role() IN ('editor','admin'));

-- Admins: unrestricted
CREATE POLICY "admin_all_rawposts" ON "RawPost"
  FOR ALL USING (auth.user_role() = 'admin');

CREATE POLICY "admin_all_signals" ON "Signal"
  FOR ALL USING (auth.user_role() = 'admin');

CREATE POLICY "admin_all_auditlog" ON "AuditLog"
  FOR ALL USING (auth.user_role() = 'admin');
