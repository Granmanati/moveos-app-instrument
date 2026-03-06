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

INSERT INTO exercise_library (name, pattern, equipment, media_video_url, sets_default, reps_default, rest_seconds_default, tier_required, level)
VALUES 
-- SQUAT (8: 2 Free, 6 Premium)
('Bodyweight Squat', 'squat', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '10-15', 60, 'free', 1),
('Goblet Squat', 'squat', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'free', 2),
('Front Squat', 'squat', 'Barbell', 'https://vimeo.com/712345/placeholder', 4, '6-8', 120, 'premium', 3),
('Bulgarian Split Squat', 'squat', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'premium', 3),
('Pistol Squat Progression', 'squat', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '5-8', 120, 'premium', 3),
('Zercher Squat', 'squat', 'Barbell', 'https://vimeo.com/712345/placeholder', 4, '6-10', 120, 'premium', 3),
('Hack Squat', 'squat', 'Machine', 'https://vimeo.com/712345/placeholder', 3, '10-15', 90, 'premium', 2),
('Sissy Squat', 'squat', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'premium', 3),

-- HINGE (8: 2 Free, 6 Premium)
('Glute Bridge', 'hinge', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '15-20', 60, 'free', 1),
('Romanian Deadlift', 'hinge', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'free', 2),
('Conventional Deadlift', 'hinge', 'Barbell', 'https://vimeo.com/712345/placeholder', 4, '3-6', 180, 'premium', 3),
('Single Leg RDL', 'hinge', 'Kettlebell', 'https://vimeo.com/712345/placeholder', 3, '8-10', 90, 'premium', 3),
('Good Morning', 'hinge', 'Barbell', 'https://vimeo.com/712345/placeholder', 3, '8-12', 120, 'premium', 3),
('Kettlebell Swing', 'hinge', 'Kettlebell', 'https://vimeo.com/712345/placeholder', 4, '15-20', 60, 'premium', 2),
('Hip Thrust', 'hinge', 'Barbell', 'https://vimeo.com/712345/placeholder', 4, '8-12', 120, 'premium', 2),
('B-Stance RDL', 'hinge', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '10-12', 90, 'premium', 2),

-- PUSH (6: 2 Free, 4 Premium)
('Push Up', 'push', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, 'AMRAP', 90, 'free', 1),
('Overhead Press', 'push', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'free', 2),
('Bench Press', 'push', 'Barbell', 'https://vimeo.com/712345/placeholder', 4, '5-8', 120, 'premium', 3),
('Dip', 'push', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '8-12', 120, 'premium', 3),
('Arnold Press', 'push', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '10-15', 90, 'premium', 2),
('Landmine Press', 'push', 'Barbell', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'premium', 2),

-- PULL (6: 2 Free, 4 Premium)
('Inverted Row', 'pull', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '10-15', 90, 'free', 1),
('Dumbbell Row', 'pull', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'free', 2),
('Pull Up', 'pull', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 4, 'AMRAP', 120, 'premium', 3),
('Barbell Row', 'pull', 'Barbell', 'https://vimeo.com/712345/placeholder', 4, '6-10', 120, 'premium', 3),
('Lat Pulldown', 'pull', 'Machine', 'https://vimeo.com/712345/placeholder', 3, '10-15', 90, 'premium', 2),
('Face Pull', 'pull', 'Cable', 'https://vimeo.com/712345/placeholder', 3, '15-20', 60, 'premium', 1),

-- CARRY (6: 2 Free, 4 Premium)
('Farmer Walk', 'carry', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '40m', 90, 'free', 1),
('Plank', 'carry', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '60s', 60, 'free', 1),
('Suitcase Carry', 'carry', 'Kettlebell', 'https://vimeo.com/712345/placeholder', 3, '40m', 90, 'premium', 2),
('Overhead Carry', 'carry', 'Dumbbell', 'https://vimeo.com/712345/placeholder', 3, '30m', 90, 'premium', 3),
('Pallof Press', 'carry', 'Cable', 'https://vimeo.com/712345/placeholder', 3, '10-15', 60, 'premium', 2),
('Ab Wheel Rollout', 'carry', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '8-12', 90, 'premium', 3),

-- REGULATE (6: 2 Free, 4 Premium)
('Box Breathing', 'regulate', 'None', 'https://vimeo.com/712345/placeholder', 1, '5m', 0, 'free', 1),
('Cat Cow', 'regulate', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 2, '10-15', 30, 'free', 1),
('90/90 Hip Switch', 'regulate', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 2, '10/side', 30, 'premium', 1),
('Thoracic Rotation', 'regulate', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 2, '8/side', 30, 'premium', 1),
('Dead Bug', 'regulate', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '10/side', 60, 'premium', 2),
('Copenhagen Plank', 'regulate', 'Bodyweight', 'https://vimeo.com/712345/placeholder', 3, '30s', 60, 'premium', 3)
ON CONFLICT DO NOTHING;
