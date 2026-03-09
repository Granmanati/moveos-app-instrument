DELETE FROM public.content_assets WHERE content_type = 'routine';

INSERT INTO public.content_assets (id, slug, title, content_type, education_topic, category, duration_seconds, feed_media_url, thumbnail_url, is_premium, expert_name, exercise_count, exercises, published, sort_order)
VALUES (
    gen_random_uuid(),
    'spinal-articulation-protocol',
    'Spinal Articulation Protocol',
    'routine',
    'Mobility',
    'Mobility',
    720,
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70',
    false,
    'Dr. Ana Torres',
    5,
    '[{"id":"ex-0","name":"Cat-Cow","sets":3,"duration":"20 sec","thumbnail":"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70"},{"id":"ex-1","name":"Thread the Needle","sets":3,"duration":"25 sec","thumbnail":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70"},{"id":"ex-2","name":"Hip 90/90","sets":3,"duration":"30 sec","thumbnail":"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70"},{"id":"ex-3","name":"World''s Greatest Stretch","sets":3,"duration":"35 sec","thumbnail":"https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70"},{"id":"ex-4","name":"Seated Rotation","sets":3,"duration":"40 sec","thumbnail":"https://images.unsplash.com/photo-1590987337591-47bcd1f4f69b?w=400&q=70"}]'::jsonb,
    true,
    0
);
INSERT INTO public.content_assets (id, slug, title, content_type, education_topic, category, duration_seconds, feed_media_url, thumbnail_url, is_premium, expert_name, exercise_count, exercises, published, sort_order)
VALUES (
    gen_random_uuid(),
    'sciatic-relief-flow',
    'Sciatic Relief Flow',
    'routine',
    'Pain Relief',
    'Pain Relief',
    480,
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70',
    false,
    'Felipe Ruiz PT',
    4,
    '[{"id":"ex-0","name":"Piriformis Stretch","sets":3,"duration":"20 sec","thumbnail":"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70"},{"id":"ex-1","name":"Pelvic Tilt","sets":3,"duration":"25 sec","thumbnail":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70"},{"id":"ex-2","name":"Knee to Chest","sets":3,"duration":"30 sec","thumbnail":"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70"},{"id":"ex-3","name":"Glute Bridge","sets":3,"duration":"35 sec","thumbnail":"https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70"}]'::jsonb,
    true,
    1
);
INSERT INTO public.content_assets (id, slug, title, content_type, education_topic, category, duration_seconds, feed_media_url, thumbnail_url, is_premium, expert_name, exercise_count, exercises, published, sort_order)
VALUES (
    gen_random_uuid(),
    'neuromuscular-re-activation',
    'Neuromuscular Re-Activation',
    'routine',
    'Strength',
    'Strength',
    840,
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70',
    true,
    'María Gómez PhD',
    6,
    '[{"id":"ex-0","name":"Dead Bug","sets":3,"duration":"20 sec","thumbnail":"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70"},{"id":"ex-1","name":"Bird Dog","sets":3,"duration":"25 sec","thumbnail":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70"},{"id":"ex-2","name":"Side Plank","sets":3,"duration":"30 sec","thumbnail":"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70"},{"id":"ex-3","name":"Copenhagen Plank","sets":3,"duration":"35 sec","thumbnail":"https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70"},{"id":"ex-4","name":"Pallof Press","sets":3,"duration":"40 sec","thumbnail":"https://images.unsplash.com/photo-1590987337591-47bcd1f4f69b?w=400&q=70"},{"id":"ex-5","name":"Single-leg RDL","sets":3,"duration":"45 sec","thumbnail":"https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&q=70"}]'::jsonb,
    true,
    2
);
INSERT INTO public.content_assets (id, slug, title, content_type, education_topic, category, duration_seconds, feed_media_url, thumbnail_url, is_premium, expert_name, exercise_count, exercises, published, sort_order)
VALUES (
    gen_random_uuid(),
    'post-load-autonomic-recovery',
    'Post-Load Autonomic Recovery',
    'routine',
    'Recovery',
    'Recovery',
    900,
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70',
    false,
    'Dr. Carlos Vera',
    5,
    '[{"id":"ex-0","name":"Diaphragmatic Breathing","sets":3,"duration":"20 sec","thumbnail":"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70"},{"id":"ex-1","name":"Supine Twist","sets":3,"duration":"25 sec","thumbnail":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70"},{"id":"ex-2","name":"Legs Up Wall","sets":3,"duration":"30 sec","thumbnail":"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70"},{"id":"ex-3","name":"Child''s Pose","sets":3,"duration":"35 sec","thumbnail":"https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70"},{"id":"ex-4","name":"Neck Release","sets":3,"duration":"40 sec","thumbnail":"https://images.unsplash.com/photo-1590987337591-47bcd1f4f69b?w=400&q=70"}]'::jsonb,
    true,
    3
);
INSERT INTO public.content_assets (id, slug, title, content_type, education_topic, category, duration_seconds, feed_media_url, thumbnail_url, is_premium, expert_name, exercise_count, exercises, published, sort_order)
VALUES (
    gen_random_uuid(),
    'hip-mobility-compound-flow',
    'Hip Mobility Compound Flow',
    'routine',
    'Mobility',
    'Mobility',
    600,
    'https://images.unsplash.com/photo-1590987337591-47bcd1f4f69b?w=400&q=70',
    'https://images.unsplash.com/photo-1590987337591-47bcd1f4f69b?w=400&q=70',
    false,
    'Laura Sanz PT',
    5,
    '[{"id":"ex-0","name":"Hip CARs","sets":3,"duration":"20 sec","thumbnail":"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70"},{"id":"ex-1","name":"Lizard Pose","sets":3,"duration":"25 sec","thumbnail":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70"},{"id":"ex-2","name":"Pigeon Pose","sets":3,"duration":"30 sec","thumbnail":"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70"},{"id":"ex-3","name":"Deep Squat Hold","sets":3,"duration":"35 sec","thumbnail":"https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70"},{"id":"ex-4","name":"Hip Flexor Lunge","sets":3,"duration":"40 sec","thumbnail":"https://images.unsplash.com/photo-1590987337591-47bcd1f4f69b?w=400&q=70"}]'::jsonb,
    true,
    4
);
INSERT INTO public.content_assets (id, slug, title, content_type, education_topic, category, duration_seconds, feed_media_url, thumbnail_url, is_premium, expert_name, exercise_count, exercises, published, sort_order)
VALUES (
    gen_random_uuid(),
    'upper-body-activation',
    'Upper Body Activation',
    'routine',
    'Warmups',
    'Warmups',
    420,
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&q=70',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&q=70',
    false,
    'Dr. Ana Torres',
    4,
    '[{"id":"ex-0","name":"Arm Circles","sets":3,"duration":"20 sec","thumbnail":"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70"},{"id":"ex-1","name":"Band Pull-Apart","sets":3,"duration":"25 sec","thumbnail":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70"},{"id":"ex-2","name":"Thoracic Extension","sets":3,"duration":"30 sec","thumbnail":"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70"},{"id":"ex-3","name":"Shoulder CARs","sets":3,"duration":"35 sec","thumbnail":"https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70"}]'::jsonb,
    true,
    5
);
INSERT INTO public.content_assets (id, slug, title, content_type, education_topic, category, duration_seconds, feed_media_url, thumbnail_url, is_premium, expert_name, exercise_count, exercises, published, sort_order)
VALUES (
    gen_random_uuid(),
    'lumbar-stability-protocol',
    'Lumbar Stability Protocol',
    'routine',
    'Protocols',
    'Protocols',
    960,
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70',
    true,
    'Felipe Ruiz PT',
    6,
    '[{"id":"ex-0","name":"McGill Big Three","sets":3,"duration":"20 sec","thumbnail":"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70"},{"id":"ex-1","name":"Bird Dog","sets":3,"duration":"25 sec","thumbnail":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70"},{"id":"ex-2","name":"Dead Bug","sets":3,"duration":"30 sec","thumbnail":"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70"},{"id":"ex-3","name":"Side Plank","sets":3,"duration":"35 sec","thumbnail":"https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70"},{"id":"ex-4","name":"Glute Bridge","sets":3,"duration":"40 sec","thumbnail":"https://images.unsplash.com/photo-1590987337591-47bcd1f4f69b?w=400&q=70"},{"id":"ex-5","name":"Bear Crawl","sets":3,"duration":"45 sec","thumbnail":"https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&q=70"}]'::jsonb,
    true,
    6
);
INSERT INTO public.content_assets (id, slug, title, content_type, education_topic, category, duration_seconds, feed_media_url, thumbnail_url, is_premium, expert_name, exercise_count, exercises, published, sort_order)
VALUES (
    gen_random_uuid(),
    'knee-load-management',
    'Knee Load Management',
    'routine',
    'Pain Relief',
    'Pain Relief',
    660,
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70',
    true,
    'María Gómez PhD',
    5,
    '[{"id":"ex-0","name":"Terminal Knee Extension","sets":3,"duration":"20 sec","thumbnail":"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70"},{"id":"ex-1","name":"Wall Sit","sets":3,"duration":"25 sec","thumbnail":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70"},{"id":"ex-2","name":"Step-Down","sets":3,"duration":"30 sec","thumbnail":"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70"},{"id":"ex-3","name":"VMO Squat","sets":3,"duration":"35 sec","thumbnail":"https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70"},{"id":"ex-4","name":"Calf Raise","sets":3,"duration":"40 sec","thumbnail":"https://images.unsplash.com/photo-1590987337591-47bcd1f4f69b?w=400&q=70"}]'::jsonb,
    true,
    7
);
INSERT INTO public.content_assets (id, slug, title, content_type, education_topic, category, duration_seconds, feed_media_url, thumbnail_url, is_premium, expert_name, exercise_count, exercises, published, sort_order)
VALUES (
    gen_random_uuid(),
    'thoracic-mobility-flow',
    'Thoracic Mobility Flow',
    'routine',
    'Mobility',
    'Mobility',
    540,
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70',
    false,
    'Dr. Carlos Vera',
    4,
    '[{"id":"ex-0","name":"Foam Roll T-Spine","sets":3,"duration":"20 sec","thumbnail":"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70"},{"id":"ex-1","name":"Open Book","sets":3,"duration":"25 sec","thumbnail":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70"},{"id":"ex-2","name":"Quadruped Rotation","sets":3,"duration":"30 sec","thumbnail":"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70"},{"id":"ex-3","name":"Thoracic Extension","sets":3,"duration":"35 sec","thumbnail":"https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70"}]'::jsonb,
    true,
    8
);
INSERT INTO public.content_assets (id, slug, title, content_type, education_topic, category, duration_seconds, feed_media_url, thumbnail_url, is_premium, expert_name, exercise_count, exercises, published, sort_order)
VALUES (
    gen_random_uuid(),
    'full-body-conditioning',
    'Full Body Conditioning',
    'routine',
    'Strength',
    'Strength',
    1200,
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&q=70',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&q=70',
    true,
    'Laura Sanz PT',
    7,
    '[{"id":"ex-0","name":"Goblet Squat","sets":3,"duration":"20 sec","thumbnail":"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70"},{"id":"ex-1","name":"Push-Up","sets":3,"duration":"25 sec","thumbnail":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70"},{"id":"ex-2","name":"Row","sets":3,"duration":"30 sec","thumbnail":"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70"},{"id":"ex-3","name":"Hip Hinge","sets":3,"duration":"35 sec","thumbnail":"https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70"},{"id":"ex-4","name":"Farmer''s Carry","sets":3,"duration":"40 sec","thumbnail":"https://images.unsplash.com/photo-1590987337591-47bcd1f4f69b?w=400&q=70"},{"id":"ex-5","name":"Plank","sets":3,"duration":"45 sec","thumbnail":"https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&q=70"},{"id":"ex-6","name":"Dead Bug","sets":3,"duration":"50 sec","thumbnail":"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70"}]'::jsonb,
    true,
    9
);
