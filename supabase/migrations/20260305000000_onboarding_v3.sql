-- Migration: Onboarding v3.0
-- Description: Adds clinical parameters to user_profile and creates an events log

-- 1. Add missing fields to user_profile safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='onboarding_completed') THEN
        ALTER TABLE public.user_profile ADD COLUMN onboarding_completed boolean DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='onboarding_version') THEN
        ALTER TABLE public.user_profile ADD COLUMN onboarding_version text DEFAULT 'v3';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='primary_objective') THEN
        ALTER TABLE public.user_profile ADD COLUMN primary_objective text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='primary_area') THEN
        ALTER TABLE public.user_profile ADD COLUMN primary_area text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='pain_current') THEN
        ALTER TABLE public.user_profile ADD COLUMN pain_current int;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='pain_7d_avg') THEN
        ALTER TABLE public.user_profile ADD COLUMN pain_7d_avg int;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='training_freq') THEN
        ALTER TABLE public.user_profile ADD COLUMN training_freq int;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='activity_level') THEN
        ALTER TABLE public.user_profile ADD COLUMN activity_level text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='sleep_avg') THEN
        ALTER TABLE public.user_profile ADD COLUMN sleep_avg int;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='stress_level') THEN
        ALTER TABLE public.user_profile ADD COLUMN stress_level int;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='pattern_squat') THEN
        ALTER TABLE public.user_profile ADD COLUMN pattern_squat text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='pattern_hinge') THEN
        ALTER TABLE public.user_profile ADD COLUMN pattern_hinge text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='pattern_push') THEN
        ALTER TABLE public.user_profile ADD COLUMN pattern_push text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='pattern_pull') THEN
        ALTER TABLE public.user_profile ADD COLUMN pattern_pull text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='pattern_carry') THEN
        ALTER TABLE public.user_profile ADD COLUMN pattern_carry text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='red_flag_night_pain') THEN
        ALTER TABLE public.user_profile ADD COLUMN red_flag_night_pain boolean DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='red_flag_neuro') THEN
        ALTER TABLE public.user_profile ADD COLUMN red_flag_neuro boolean DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='red_flag_trauma') THEN
        ALTER TABLE public.user_profile ADD COLUMN red_flag_trauma boolean DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='assigned_phase') THEN
        ALTER TABLE public.user_profile ADD COLUMN assigned_phase text;
    END IF;
END $$;

-- 2. Create onboarding_events table for traceability
CREATE TABLE IF NOT EXISTS public.onboarding_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    step int,
    event text,
    payload jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS safely
ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;

-- Policies for onboarding_events
CREATE POLICY "Users can insert their own onboarding events" 
    ON public.onboarding_events FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own onboarding events" 
    ON public.onboarding_events FOR SELECT 
    USING (auth.uid() = user_id);
