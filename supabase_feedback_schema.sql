-- USER FEEDBACKS TABLE
-- This table stores ratings and comments from users about specific experiments.

CREATE TABLE IF NOT EXISTS public.user_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    experiment_id TEXT NOT NULL, -- Format: 'lab-slug/exp-id'
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, experiment_id)
);

-- RLS POLICIES
ALTER TABLE public.user_feedbacks ENABLE ROW LEVEL SECURITY;

-- 1. Users can view their own feedbacks
CREATE POLICY "Users can view their own feedbacks" 
ON public.user_feedbacks FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 2. Users can insert their own feedbacks
CREATE POLICY "Users can insert their own feedbacks" 
ON public.user_feedbacks FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own feedbacks
CREATE POLICY "Users can update their own feedbacks" 
ON public.user_feedbacks FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- 4. Users can delete their own feedbacks
CREATE POLICY "Users can delete their own feedbacks" 
ON public.user_feedbacks FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS user_feedbacks_user_id_idx ON public.user_feedbacks(user_id);
CREATE INDEX IF NOT EXISTS user_feedbacks_experiment_id_idx ON public.user_feedbacks(experiment_id);
