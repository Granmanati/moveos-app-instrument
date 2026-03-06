-- ==========================================
-- Fase 25: Explore Library V1 (Data + Seed)
-- ==========================================

-- 1) Add new columns idempotently
DO $$ 
BEGIN
    -- equipment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_library' AND column_name = 'equipment') THEN
        ALTER TABLE exercise_library ADD COLUMN equipment TEXT DEFAULT 'Bodyweight';
    END IF;

    -- sets_default
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_library' AND column_name = 'sets_default') THEN
        ALTER TABLE exercise_library ADD COLUMN sets_default INT DEFAULT 3;
    END IF;

    -- reps_default
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_library' AND column_name = 'reps_default') THEN
        ALTER TABLE exercise_library ADD COLUMN reps_default TEXT DEFAULT '8-12';
    END IF;

    -- rest_seconds_default
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_library' AND column_name = 'rest_seconds_default') THEN
        ALTER TABLE exercise_library ADD COLUMN rest_seconds_default INT DEFAULT 60;
    END IF;

    -- tier_required (free, premium, pro)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_library' AND column_name = 'tier_required') THEN
        ALTER TABLE exercise_library ADD COLUMN tier_required TEXT DEFAULT 'premium';
    END IF;

    -- is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_library' AND column_name = 'is_active') THEN
        ALTER TABLE exercise_library ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;


-- 2) Seed 40 Exercises
-- Minimal temporary seed data to populate the Explore Feed
-- They use a placeholder video URL if they don't have one initially

INSERT INTO exercise_library (id, name, pattern, equipment, media_video_url, sets_default, reps_default, rest_seconds_default, tier_required, level)
VALUES 
-- SQUAT (8: 2 Free, 6 Premium)
(gen_random_uuid(), 'Bodyweight Squat', 'SQUAT', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '10-15', 60, 'free', 1),
(gen_random_uuid(), 'Goblet Squat', 'SQUAT', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'free', 2),
(gen_random_uuid(), 'Front Squat', 'SQUAT', 'Barbell', 'https://vimeo.com/712345/placeholder', 4, '6-8', 120, 'premium', 3),
(gen_random_uuid(), 'Bulgarian Split Squat', 'SQUAT', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'premium', 3),
(gen_random_uuid(), 'Pistol Squat Progression', 'SQUAT', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '5-8', 120, 'premium', 4),
(gen_random_uuid(), 'Zercher Squat', 'SQUAT', 'Barbell', 'https://vimeo.com/712345/placeholder', 4, '6-10', 120, 'premium', 3),
(gen_random_uuid(), 'Hack Squat', 'SQUAT', 'Machine', 'https://vimeo.com/712345/placeholder', 3, '10-15', 90, 'premium', 2),
(gen_random_uuid(), 'Sissy Squat', 'SQUAT', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'premium', 4),

-- HINGE (8: 2 Free, 6 Premium)
(gen_random_uuid(), 'Glute Bridge', 'HINGE', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '15-20', 60, 'free', 1),
(gen_random_uuid(), 'Romanian Deadlift', 'HINGE', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'free', 2),
(gen_random_uuid(), 'Conventional Deadlift', 'HINGE', 'Barbell', 'https://vimeo.com/712345/placeholder', 4, '3-6', 180, 'premium', 3),
(gen_random_uuid(), 'Single Leg RDL', 'HINGE', 'Kettlebell', 'https://vimeo.com/712345/placeholder', 3, '8-10', 90, 'premium', 3),
(gen_random_uuid(), 'Good Morning', 'HINGE', 'Barbell', 'https://vimeo.com/712345/placeholder', 3, '8-12', 120, 'premium', 3),
(gen_random_uuid(), 'Kettlebell Swing', 'HINGE', 'Kettlebell', 'https://vimeo.com/712345/placeholder', 4, '15-20', 60, 'premium', 2),
(gen_random_uuid(), 'Hip Thrust', 'HINGE', 'Barbell', 'https://vimeo.com/712345/placeholder', 4, '8-12', 120, 'premium', 2),
(gen_random_uuid(), 'B-Stance RDL', 'HINGE', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '10-12', 90, 'premium', 2),

-- PUSH (6: 2 Free, 4 Premium)
(gen_random_uuid(), 'Push Up', 'PUSH', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, 'AMRAP', 90, 'free', 1),
(gen_random_uuid(), 'Overhead Press', 'PUSH', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'free', 2),
(gen_random_uuid(), 'Bench Press', 'PUSH', 'Barbell', 'https://vimeo.com/712345/placeholder', 4, '5-8', 120, 'premium', 3),
(gen_random_uuid(), 'Dip', 'PUSH', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '8-12', 120, 'premium', 3),
(gen_random_uuid(), 'Arnold Press', 'PUSH', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '10-15', 90, 'premium', 2),
(gen_random_uuid(), 'Landmine Press', 'PUSH', 'Barbell', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'premium', 2),

-- PULL (6: 2 Free, 4 Premium)
(gen_random_uuid(), 'Inverted Row', 'PULL', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '10-15', 90, 'free', 1),
(gen_random_uuid(), 'Dumbbell Row', 'PULL', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'free', 2),
(gen_random_uuid(), 'Pull Up', 'PULL', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 4, 'AMRAP', 120, 'premium', 3),
(gen_random_uuid(), 'Barbell Row', 'PULL', 'Barbell', 'https://vimeo.com/712345/placeholder', 4, '6-10', 120, 'premium', 3),
(gen_random_uuid(), 'Lat Pulldown', 'PULL', 'Machine', 'https://vimeo.com/712345/placeholder', 3, '10-15', 90, 'premium', 2),
(gen_random_uuid(), 'Face Pull', 'PULL', 'Cable', 'https://vimeo.com/712345/placeholder', 3, '15-20', 60, 'premium', 1),

-- CARRY (6: 2 Free, 4 Premium)
(gen_random_uuid(), 'Farmer Walk', 'CARRY', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '40m', 90, 'free', 1),
(gen_random_uuid(), 'Plank', 'CARRY', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '60s', 60, 'free', 1),
(gen_random_uuid(), 'Suitcase Carry', 'CARRY', 'Kettlebell', 'https://vimeo.com/712345/placeholder', 3, '40m', 90, 'premium', 2),
(gen_random_uuid(), 'Overhead Carry', 'CARRY', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '30m', 90, 'premium', 3),
(gen_random_uuid(), 'Pallof Press', 'CARRY', 'Cable', 'https://vimeo.com/712345/placeholder', 3, '10-15', 60, 'premium', 2),
(gen_random_uuid(), 'Ab Wheel Rollout', 'CARRY', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'premium', 3),

-- REGULATE (6: 2 Free, 4 Premium)
(gen_random_uuid(), 'Box Breathing', 'REGULATE', 'None', 'https://vimeo.com/712345/placeholder', 1, '5m', 0, 'free', 1),
(gen_random_uuid(), 'Cat Cow', 'REGULATE', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 2, '10-15', 30, 'free', 1),
(gen_random_uuid(), '90/90 Hip Switch', 'REGULATE', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 2, '10/side', 30, 'premium', 1),
(gen_random_uuid(), 'Thoracic Rotation', 'REGULATE', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 2, '8/side', 30, 'premium', 1),
(gen_random_uuid(), 'Dead Bug', 'REGULATE', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '10/side', 60, 'premium', 2),
(gen_random_uuid(), 'Copenhagen Plank', 'REGULATE', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '30s', 60, 'premium', 3)
ON CONFLICT DO NOTHING;
