-- ============================================================
-- MOVE OS — Polish Pack v1.0 Migration
-- Run this in Supabase SQL Editor (safe, uses IF NOT EXISTS)
-- ============================================================

-- 1. EXTEND user_profile with new columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='preferred_language') THEN
        ALTER TABLE public.user_profile ADD COLUMN preferred_language text DEFAULT 'en';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='subscription_tier') THEN
        ALTER TABLE public.user_profile ADD COLUMN subscription_tier text DEFAULT 'free';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='subscription_status') THEN
        ALTER TABLE public.user_profile ADD COLUMN subscription_status text DEFAULT 'free';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='trial_started_at') THEN
        ALTER TABLE public.user_profile ADD COLUMN trial_started_at timestamptz;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='trial_ends_at') THEN
        ALTER TABLE public.user_profile ADD COLUMN trial_ends_at timestamptz;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_profile' AND column_name='onboarding_payload') THEN
        ALTER TABLE public.user_profile ADD COLUMN onboarding_payload jsonb;
    END IF;
END $$;


-- 2. RPC: start_trial()
-- Activates a 7-day premium trial for the calling user
CREATE OR REPLACE FUNCTION public.start_trial()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _user_id uuid;
    _result jsonb;
BEGIN
    _user_id := auth.uid();

    IF _user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    UPDATE public.user_profile
    SET
        subscription_tier = 'premium',
        subscription_status = 'trialing',
        trial_started_at = now(),
        trial_ends_at = now() + INTERVAL '7 days'
    WHERE user_id = _user_id;

    SELECT jsonb_build_object(
        'subscription_tier', subscription_tier,
        'subscription_status', subscription_status,
        'trial_started_at', trial_started_at,
        'trial_ends_at', trial_ends_at
    ) INTO _result
    FROM public.user_profile
    WHERE user_id = _user_id;

    RETURN _result;
END;
$$;


-- 3. RPC: refresh_subscription_state()
-- Call on app load to auto-expire stale trials
CREATE OR REPLACE FUNCTION public.refresh_subscription_state()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _user_id uuid;
    _result jsonb;
BEGIN
    _user_id := auth.uid();

    IF _user_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Expire trial if past trial_ends_at
    UPDATE public.user_profile
    SET
        subscription_tier = 'free',
        subscription_status = 'free',
        trial_started_at = NULL,
        trial_ends_at = NULL
    WHERE
        user_id = _user_id
        AND subscription_status = 'trialing'
        AND trial_ends_at < now();

    SELECT jsonb_build_object(
        'subscription_tier', subscription_tier,
        'subscription_status', subscription_status,
        'trial_ends_at', trial_ends_at,
        'preferred_language', preferred_language
    ) INTO _result
    FROM public.user_profile
    WHERE user_id = _user_id;

    RETURN _result;
END;
$$;


-- 4. RPC: set_language(lang text)
-- Persists language preference to user_profile
CREATE OR REPLACE FUNCTION public.set_language(lang text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    UPDATE public.user_profile
    SET preferred_language = lang
    WHERE user_id = auth.uid();
END;
$$;


-- 5. Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.start_trial() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_subscription_state() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_language(text) TO authenticated;
