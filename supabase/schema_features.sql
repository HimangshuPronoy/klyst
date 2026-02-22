-- ============================================
-- ColdFlow Features Schema Update
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Unsubscribes table
CREATE TABLE IF NOT EXISTS unsubscribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  reason TEXT DEFAULT '',
  unsubscribed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE unsubscribes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own unsubscribes" ON unsubscribes FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_unsubscribes_email ON unsubscribes(email);
CREATE INDEX IF NOT EXISTS idx_unsubscribes_user ON unsubscribes(user_id);

-- Unique constraint: one unsubscribe per email per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_unsubscribes_unique ON unsubscribes(user_id, email);

-- 2. Email Templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT DEFAULT '',
  body TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own templates" ON email_templates FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_templates_user ON email_templates(user_id);

-- 3. Add scheduled_at to campaigns
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
