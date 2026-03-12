-- Bhilai EE Labs: Supabase Database Schema
-- Run this script in the Supabase SQL Editor to prepare your project.

-- 1. PROFILES: User-specific preferences and details
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  roll_number text,
  theme text DEFAULT 'system',
  default_lab text,
  print_preferences jsonb DEFAULT '{
    "theory": true,
    "apparatus": true,
    "procedures": true,
    "observations": true,
    "calculations": true
  }'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. STARRED EXPERIMENTS: Experiment bookmarks
CREATE TABLE IF NOT EXISTS public.starred_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  experiment_id text NOT NULL, -- The slug of the experiment
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, experiment_id)
);

-- Enable RLS for starred_experiments
ALTER TABLE public.starred_experiments ENABLE ROW LEVEL SECURITY;

-- 3. RECENTLY VIEWED: Navigation history
CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  experiment_id text NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Enable RLS for recently_viewed
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

-- 4. SAVED OBSERVATIONS: Lab data persistence
CREATE TABLE IF NOT EXISTS public.saved_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  experiment_id text NOT NULL,
  section_id text NOT NULL, -- e.g. 'observation'
  data jsonb NOT NULL,      -- The actual row/cell data
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, experiment_id, section_id)
);

-- Enable RLS for saved_observations
ALTER TABLE public.saved_observations ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY POLICIES
--------------------------------------------------------------------------------

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Starred Experiments policies
CREATE POLICY "Users can view own stars" ON public.starred_experiments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can bookmark experiments" ON public.starred_experiments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove benchmarks" ON public.starred_experiments FOR DELETE USING (auth.uid() = user_id);

-- Recently Viewed policies
CREATE POLICY "Users can view own history" ON public.recently_viewed FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can record visit" ON public.recently_viewed FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can clear history" ON public.recently_viewed FOR DELETE USING (auth.uid() = user_id);

-- Saved Observations policies
CREATE POLICY "Users can view own observations" ON public.saved_observations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save observations" ON public.saved_observations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own observations" ON public.saved_observations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete observations" ON public.saved_observations FOR DELETE USING (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- AUTOMATION: TRIGGER FOR NEW USERS
--------------------------------------------------------------------------------

-- This function automatically creates a profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--------------------------------------------------------------------------------
-- PERFORMANCE INDICES
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_stars_user ON public.starred_experiments(user_id);
CREATE INDEX IF NOT EXISTS idx_history_user ON public.recently_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_observations_user_exp ON public.saved_observations(user_id, experiment_id);
