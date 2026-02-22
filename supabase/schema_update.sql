-- Schema update: Add SMTP credentials to email_accounts
-- Run this in your Supabase SQL Editor

ALTER TABLE email_accounts
ADD COLUMN IF NOT EXISTS smtp_host TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587,
ADD COLUMN IF NOT EXISTS smtp_user TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS smtp_pass TEXT DEFAULT '';
