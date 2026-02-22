-- ============================================
-- ColdFlow Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  company TEXT DEFAULT '',
  role TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. Email Accounts
CREATE TABLE IF NOT EXISTS email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  provider TEXT DEFAULT 'SMTP',
  smtp_host TEXT DEFAULT '',
  smtp_port INTEGER DEFAULT 587,
  smtp_user TEXT DEFAULT '',
  smtp_pass TEXT DEFAULT '',
  health INTEGER DEFAULT 100,
  warmup_enabled BOOLEAN DEFAULT false,
  warmup_progress INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 50,
  sent_today INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own accounts" ON email_accounts FOR ALL USING (auth.uid() = user_id);

-- 3. Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  account_id UUID REFERENCES email_accounts(id) ON DELETE SET NULL,
  schedule TEXT DEFAULT '9:00 AM - 5:00 PM',
  timezone TEXT DEFAULT 'UTC',
  steps JSONB DEFAULT '[]'::jsonb,
  lead_list_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own campaigns" ON campaigns FOR ALL USING (auth.uid() = user_id);

-- 4. Lead Lists
CREATE TABLE IF NOT EXISTS lead_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lead_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own lead lists" ON lead_lists FOR ALL USING (auth.uid() = user_id);

-- 5. Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES lead_lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  company TEXT DEFAULT '',
  title TEXT DEFAULT '',
  status TEXT DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified', 'bounced')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own leads" ON leads FOR ALL USING (auth.uid() = user_id);

-- 6. Campaign Sends (tracking)
CREATE TABLE IF NOT EXISTS campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step INTEGER DEFAULT 1,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'replied', 'bounced')),
  sent_at TIMESTAMPTZ DEFAULT now(),
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ
);

ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sends" ON campaign_sends FOR ALL USING (auth.uid() = user_id);

-- 7. Warmup Logs
CREATE TABLE IF NOT EXISTS warmup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  sent INTEGER DEFAULT 0,
  inbox_count INTEGER DEFAULT 0,
  spam_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE warmup_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own warmup logs" ON warmup_logs FOR ALL USING (auth.uid() = user_id);

-- 8. Settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_max INTEGER DEFAULT 500,
  per_account_max INTEGER DEFAULT 50,
  min_delay INTEGER DEFAULT 60,
  max_delay INTEGER DEFAULT 180,
  notifications JSONB DEFAULT '{"campaignComplete": true, "dailyReport": true, "bounceAlert": true, "warmupComplete": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON settings FOR ALL USING (auth.uid() = user_id);

-- Auto-create settings on signup
CREATE OR REPLACE FUNCTION handle_new_user_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_settings();

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_email_accounts_user ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_list ON leads(list_id);
CREATE INDEX IF NOT EXISTS idx_leads_user ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign ON campaign_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_user ON campaign_sends(user_id);
CREATE INDEX IF NOT EXISTS idx_warmup_logs_account ON warmup_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_lead_lists_user ON lead_lists(user_id);
