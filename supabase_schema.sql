-- Supabase Database Schema for Runway Form Assistant

-- 1. Daily Submissions Table
CREATE TABLE public.daily_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    submission_date DATE DEFAULT CURRENT_DATE NOT NULL,
    purpose TEXT[] NOT NULL,
    seat_number TEXT NOT NULL,
    duration TEXT NOT NULL,
    team_members TEXT NOT NULL,
    feedback TEXT,
    status TEXT DEFAULT 'Draft' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS) for daily_submissions
ALTER TABLE public.daily_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own submissions"
    ON public.daily_submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own submissions"
    ON public.daily_submissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
    ON public.daily_submissions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
