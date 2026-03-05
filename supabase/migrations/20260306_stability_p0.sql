-- MOVE OS: System Stability Pack P0 (Trial Correctness DB Migration)
-- Execute this file in the Supabase SQL Editor.

-- 1. Ensure columns exist idempotently
ALTER TABLE public.user_profile ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';
ALTER TABLE public.user_profile ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free';
ALTER TABLE public.user_profile ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free';
ALTER TABLE public.user_profile ADD COLUMN IF NOT EXISTS trial_started_at timestamptz;
ALTER TABLE public.user_profile ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- 2. Create RPC for starting a trial (Strict 7-day server-side logic)
CREATE OR REPLACE FUNCTION public.start_trial()
RETURNS public.user_profile
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_profile public.user_profile;
BEGIN
    UPDATE public.user_profile
    SET
        subscription_status = 'trialing',
        subscription_tier = 'premium',
        trial_started_at = now(),
        trial_ends_at = now() + interval '7 days'
    WHERE user_id = auth.uid()
    RETURNING * INTO v_user_profile;

    RETURN v_user_profile;
END;
$$;

-- 3. Create RPC to refresh subscription state efficiently
-- Auto-downgrades the user to 'free' if their trial has expired.
CREATE OR REPLACE FUNCTION public.refresh_subscription_state()
RETURNS public.user_profile
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_profile public.user_profile;
BEGIN
    -- Check if we need to expire
    UPDATE public.user_profile
    SET
        subscription_status = 'free',
        subscription_tier = 'free'
    WHERE user_id = auth.uid()
      AND subscription_status = 'trialing'
      AND trial_ends_at < now()
    RETURNING * INTO v_user_profile;

    -- If no update happened (not expired or not trialing), just fetch current
    IF v_user_profile IS NULL THEN
        SELECT * INTO v_user_profile
        FROM public.user_profile
        WHERE user_id = auth.uid();
    END IF;

    RETURN v_user_profile;
END;
$$;

-- Ensure execute permissions on RPCs
GRANT EXECUTE ON FUNCTION public.start_trial() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_subscription_state() TO authenticated;
