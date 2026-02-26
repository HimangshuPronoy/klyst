-----------------------------------------------------------
-- 1. AUTH SCHEMA: public.profiles
-----------------------------------------------------------
-- This table links to the Supabase auth.users table 
-- to store profile data.

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are strictly private in this app. Users can only see their own profile.
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-----------------------------------------------------------
-- 2. AUTH TRIGGERS
-----------------------------------------------------------
-- Automatically create a profile when a new user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger logic for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-----------------------------------------------------------
-- 3. CORE APP SCHEMA: public.scraped_ads
-----------------------------------------------------------
-- Stores the ad DNA scraped from URLs. 
-- IMPORTANT: This data belongs ONLY to the user who scraped it.

CREATE TABLE scraped_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  original_url TEXT,
  hook_text TEXT,
  spend_estimate TEXT,
  days_active INTEGER,
  format TEXT,
  image_url TEXT,
  visual_dna JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) to enforce privacy
ALTER TABLE scraped_ads ENABLE ROW LEVEL SECURITY;

-- Strict Policies: A user can ONLY interact with rows where user_id matches their auth.uid()

CREATE POLICY "Users can view own scraped ads" 
ON scraped_ads FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scraped ads" 
ON scraped_ads FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scraped ads" 
ON scraped_ads FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scraped ads" 
ON scraped_ads FOR DELETE 
USING (auth.uid() = user_id);
