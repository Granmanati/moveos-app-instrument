-- ============================================================
-- MOVE OS — Adaptive Engine Stabilization (Phase 26)
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Ensure user_pattern_state table accurately reflects bigint for current_exercise_id
CREATE TABLE IF NOT EXISTS public.user_pattern_state (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    pattern text NOT NULL,
    current_exercise_id bigint REFERENCES public.exercise_library(id),
    current_level int DEFAULT 1,
    pain_last int DEFAULT 0,
    adherence_last_7d int DEFAULT 100,
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, pattern)
);

-- 2. RPC: get_next_exercise_for_pattern
-- Finds the active progression or regression for a specific pattern based on pain/adherence factors.
CREATE OR REPLACE FUNCTION public.get_next_exercise_for_pattern(p_user_id uuid, p_pattern text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_exercise_id bigint;
    v_pain_last int;
    v_adherence int;
    v_candidate_id bigint;
    v_current_prog_of bigint;
    v_current_reg_of bigint;
BEGIN
    -- Get current state
    SELECT current_exercise_id, pain_last, adherence_last_7d
    INTO v_current_exercise_id, v_pain_last, v_adherence
    FROM public.user_pattern_state
    WHERE user_id = p_user_id AND pattern = p_pattern;

    IF v_current_exercise_id IS NOT NULL THEN
        -- Get current relationships and evaluate if still active
        SELECT progression_of, regression_of INTO v_current_prog_of, v_current_reg_of
        FROM public.exercise_library
        WHERE id = v_current_exercise_id AND is_active = true;

        -- If current exercise was disabled, fallback handled below via candidate_id IS NULL rule
        IF FOUND THEN
            -- PROGRESSION RULE: Pain <= 2 AND Adherence >= 80%
            IF v_pain_last <= 2 AND v_adherence >= 80 THEN
                SELECT id INTO v_candidate_id
                FROM public.exercise_library
                WHERE progression_of = v_current_exercise_id AND is_active = true
                ORDER BY level ASC LIMIT 1;
                
                IF v_candidate_id IS NOT NULL THEN
                    RETURN v_candidate_id;
                END IF;
            END IF;

            -- REGRESSION RULE: Pain >= 6
            IF v_pain_last >= 6 AND v_current_reg_of IS NOT NULL THEN
                SELECT id INTO v_candidate_id
                FROM public.exercise_library
                WHERE id = v_current_reg_of AND is_active = true;
                
                IF v_candidate_id IS NOT NULL THEN
                    RETURN v_candidate_id;
                END IF;
            END IF;

            -- MAINTAIN CURRENT
            RETURN v_current_exercise_id;
        END IF;
    END IF;

    -- FALLBACK: Lowest level active exercise for that pattern
    SELECT id INTO v_candidate_id
    FROM public.exercise_library
    WHERE pattern = p_pattern AND is_active = true
    ORDER BY level ASC, id ASC
    LIMIT 1;

    RETURN v_candidate_id;
END;
$$;


-- 3. RPC: initialize_user_pattern_state
CREATE OR REPLACE FUNCTION public.initialize_user_pattern_state(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pattern text;
    v_exercise_id bigint;
BEGIN
    FOR v_pattern IN SELECT unnest(ARRAY['squat', 'hinge', 'push', 'pull', 'carry', 'regulate'])
    LOOP
        -- Find base active exercise
        SELECT id INTO v_exercise_id
        FROM public.exercise_library
        WHERE pattern = v_pattern AND is_active = true
        ORDER BY level ASC, id ASC
        LIMIT 1;

        IF v_exercise_id IS NOT NULL THEN
            INSERT INTO public.user_pattern_state (user_id, pattern, current_exercise_id, current_level, pain_last, adherence_last_7d)
            VALUES (p_user_id, v_pattern, v_exercise_id, 1, 0, 100)
            ON CONFLICT (user_id, pattern) 
            DO UPDATE SET current_exercise_id = EXCLUDED.current_exercise_id;
        END IF;
    END LOOP;
END;
$$;


-- 4. RPC: generate_session
CREATE OR REPLACE FUNCTION public.generate_session()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_session_id uuid;
    v_pattern text;
    v_target_exercise_id bigint;
    v_ex_row record;
    v_block_order int := 0;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

    -- Ensure pattern state exists
    IF NOT EXISTS (SELECT 1 FROM public.user_pattern_state WHERE user_id = v_user_id) THEN
        PERFORM public.initialize_user_pattern_state(v_user_id);
    END IF;

    -- Delete today's incomplete session if exists to avoid duplicates (idempotent rule)
    DELETE FROM public.session_exercises 
    WHERE session_id IN (
        SELECT id FROM public.sessions 
        WHERE user_id = v_user_id AND date(scheduled_for) = current_date AND is_completed = false
    );
    DELETE FROM public.sessions 
    WHERE user_id = v_user_id AND date(scheduled_for) = current_date AND is_completed = false;

    -- Create new session for today
    INSERT INTO public.sessions (user_id, phase, block_count, scheduled_for, energy_target, is_completed)
    VALUES (v_user_id, 'Foundation', 6, current_date, 'Medium', false)
    RETURNING id INTO v_session_id;

    -- Generate blocks for all core patterns
    FOR v_pattern IN SELECT unnest(ARRAY['squat', 'hinge', 'push', 'pull', 'carry', 'regulate'])
    LOOP
        -- Discover adaptive exercise
        v_target_exercise_id := public.get_next_exercise_for_pattern(v_user_id, v_pattern);

        IF v_target_exercise_id IS NOT NULL THEN
            -- Retrieve config from library
            SELECT * INTO v_ex_row FROM public.exercise_library WHERE id = v_target_exercise_id;

            v_block_order := v_block_order + 1;

            INSERT INTO public.session_exercises (
                session_id, exercise_id, pattern, is_completed, 
                sets, reps_min, reps_max, rest_sec, block_order
            )
            VALUES (
                v_session_id, v_ex_row.id, v_pattern, false, 
                v_ex_row.default_sets, 
                v_ex_row.default_reps_min, 
                v_ex_row.default_reps_max, 
                v_ex_row.default_rest_sec,
                v_block_order
            );
        END IF;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'session_id', v_session_id);
END;
$$;


-- 5. RPC: update_pattern_state_after_session
CREATE OR REPLACE FUNCTION public.update_pattern_state_after_session(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_row record;
    v_next_exercise_id bigint;
    v_pain_avg int;
    v_adherence int;
BEGIN
    SELECT user_id INTO v_user_id FROM public.sessions WHERE id = p_session_id;

    FOR v_row IN 
        SELECT se.pattern, se.exercise_id, 
               COALESCE(AVG(sel.pain_level), 0)::int as avg_pain,
               COUNT(sel.id) as log_count,
               se.sets
        FROM public.session_exercises se
        LEFT JOIN public.session_exercise_logs sel ON se.id = sel.session_exercise_id
        WHERE se.session_id = p_session_id AND se.is_completed = true
        GROUP BY se.pattern, se.exercise_id, se.sets
    LOOP
        v_pain_avg := v_row.avg_pain;
        
        -- Rough adherence proxy: logs vs targeted sets
        IF v_row.sets > 0 THEN
            v_adherence := LEAST(100, (v_row.log_count::float / v_row.sets::float) * 100)::int;
        ELSE
            v_adherence := 100;
        END IF;

        -- Update the state record
        UPDATE public.user_pattern_state
        SET pain_last = v_pain_avg,
            adherence_last_7d = (adherence_last_7d + v_adherence) / 2, -- Moving average
            updated_at = now()
        WHERE user_id = v_user_id AND pattern = v_row.pattern;

        -- Compute the next target based on the new pain/adherence factors
        v_next_exercise_id := public.get_next_exercise_for_pattern(v_user_id, v_row.pattern);

        -- Persist the engine's decision for the next cycle
        UPDATE public.user_pattern_state
        SET current_exercise_id = v_next_exercise_id
        WHERE user_id = v_user_id AND pattern = v_row.pattern;
    END LOOP;
END;
$$;


-- 6. RPC: complete_session
CREATE OR REPLACE FUNCTION public.complete_session(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_all_completed boolean;
BEGIN
    -- Only allow the owner
    SELECT user_id INTO v_user_id FROM public.sessions WHERE id = p_session_id;
    IF v_user_id != auth.uid() THEN RAISE EXCEPTION 'Unauthorized'; END IF;

    -- Check if all exercises are marked completed
    SELECT bool_and(is_completed) INTO v_all_completed
    FROM public.session_exercises
    WHERE session_id = p_session_id;

    IF NOT v_all_completed THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not all blocks are completed');
    END IF;

    -- Mark Session Check
    UPDATE public.sessions
    SET is_completed = true, completed_at = now()
    WHERE id = p_session_id;

    -- Run the Adaptive Engine Matrix update
    PERFORM public.update_pattern_state_after_session(p_session_id);

    RETURN jsonb_build_object('success', true);
END;
$$;
