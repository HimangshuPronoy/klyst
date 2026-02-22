-- ============================================
-- ColdFlow CRM Schema Update
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Prospects (CRM contacts with pipeline)
CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  company TEXT DEFAULT '',
  title TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  stage TEXT DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'interested', 'meeting', 'proposal', 'closed_won', 'closed_lost')),
  deal_value DECIMAL(12, 2) DEFAULT 0,
  source TEXT DEFAULT 'manual',
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  notes TEXT DEFAULT '',
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prospects" ON prospects FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_prospects_user ON prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_prospects_stage ON prospects(stage);

-- 2. Prospect Activities (timeline)
CREATE TABLE IF NOT EXISTS prospect_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email_sent', 'email_opened', 'email_replied', 'note', 'call', 'meeting', 'stage_change')),
  content TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE prospect_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own activities" ON prospect_activities FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_activities_prospect ON prospect_activities(prospect_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON prospect_activities(user_id);
