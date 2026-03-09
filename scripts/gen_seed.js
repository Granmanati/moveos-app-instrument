// Node.js script to generate SQL inserts for content_assets
import fs from 'fs';

const THUMBS = [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70',
    'https://images.unsplash.com/photo-1590987337591-47bcd1f4f69b?w=400&q=70',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&q=70',
];

const makeExercises = (names) =>
    names.map((name, i) => ({
        id: `ex-${i}`,
        name,
        sets: 3,
        duration: `${20 + i * 5} sec`,
        thumbnail: THUMBS[i % THUMBS.length],
    }));

const ROUTINES = [
    {
        id: 'r1', title: 'Spinal Articulation Protocol', duration: '12 min', category: 'Mobility',
        expert: 'Dr. Ana Torres', thumbnail: THUMBS[1], exerciseCount: 5, premium: false,
        exercises: makeExercises(['Cat-Cow', 'Thread the Needle', 'Hip 90/90', "World's Greatest Stretch", 'Seated Rotation']),
    },
    {
        id: 'r2', title: 'Sciatic Relief Flow', duration: '8 min', category: 'Pain Relief',
        expert: 'Felipe Ruiz PT', thumbnail: THUMBS[0], exerciseCount: 4, premium: false,
        exercises: makeExercises(['Piriformis Stretch', 'Pelvic Tilt', 'Knee to Chest', 'Glute Bridge']),
    },
    {
        id: 'r3', title: 'Neuromuscular Re-Activation', duration: '14 min', category: 'Strength',
        expert: 'María Gómez PhD', thumbnail: THUMBS[2], exerciseCount: 6, premium: true,
        exercises: makeExercises(['Dead Bug', 'Bird Dog', 'Side Plank', 'Copenhagen Plank', 'Pallof Press', 'Single-leg RDL']),
    },
    {
        id: 'r4', title: 'Post-Load Autonomic Recovery', duration: '15 min', category: 'Recovery',
        expert: 'Dr. Carlos Vera', thumbnail: THUMBS[3], exerciseCount: 5, premium: false,
        exercises: makeExercises(['Diaphragmatic Breathing', 'Supine Twist', 'Legs Up Wall', "Child's Pose", 'Neck Release']),
    },
    {
        id: 'r5', title: 'Hip Mobility Compound Flow', duration: '10 min', category: 'Mobility',
        expert: 'Laura Sanz PT', thumbnail: THUMBS[4], exerciseCount: 5, premium: false,
        exercises: makeExercises(['Hip CARs', 'Lizard Pose', 'Pigeon Pose', 'Deep Squat Hold', 'Hip Flexor Lunge']),
    },
    {
        id: 'r6', title: 'Upper Body Activation', duration: '7 min', category: 'Warmups',
        expert: 'Dr. Ana Torres', thumbnail: THUMBS[5], exerciseCount: 4, premium: false,
        exercises: makeExercises(['Arm Circles', 'Band Pull-Apart', 'Thoracic Extension', 'Shoulder CARs']),
    },
    {
        id: 'r7', title: 'Lumbar Stability Protocol', duration: '16 min', category: 'Protocols',
        expert: 'Felipe Ruiz PT', thumbnail: THUMBS[0], exerciseCount: 6, premium: true,
        exercises: makeExercises(['McGill Big Three', 'Bird Dog', 'Dead Bug', 'Side Plank', 'Glute Bridge', 'Bear Crawl']),
    },
    {
        id: 'r8', title: 'Knee Load Management', duration: '11 min', category: 'Pain Relief',
        expert: 'María Gómez PhD', thumbnail: THUMBS[2], exerciseCount: 5, premium: true,
        exercises: makeExercises(['Terminal Knee Extension', 'Wall Sit', 'Step-Down', 'VMO Squat', 'Calf Raise']),
    },
    {
        id: 'r9', title: 'Thoracic Mobility Flow', duration: '9 min', category: 'Mobility',
        expert: 'Dr. Carlos Vera', thumbnail: THUMBS[3], exerciseCount: 4, premium: false,
        exercises: makeExercises(['Foam Roll T-Spine', 'Open Book', 'Quadruped Rotation', 'Thoracic Extension']),
    },
    {
        id: 'r10', title: 'Full Body Conditioning', duration: '20 min', category: 'Strength',
        expert: 'Laura Sanz PT', thumbnail: THUMBS[5], exerciseCount: 7, premium: true,
        exercises: makeExercises(['Goblet Squat', 'Push-Up', 'Row', 'Hip Hinge', "Farmer's Carry", 'Plank', 'Dead Bug']),
    },
];

let sql = "DELETE FROM public.content_assets WHERE content_type = 'routine';\n\n";

ROUTINES.forEach((r, idx) => {
    const durSec = parseInt(r.duration.split(' ')[0]) * 60;

    // We escape single quotes in JSON and title
    const safeTitle = r.title.replace(/'/g, "''");
    const safeExpert = r.expert.replace(/'/g, "''");
    const safeJson = JSON.stringify(r.exercises).replace(/'/g, "''");
    const safeSlug = r.title.toLowerCase().replace(/[^a-z0-9]/g, '-');

    sql += `INSERT INTO public.content_assets (id, slug, title, content_type, education_topic, category, duration_seconds, feed_media_url, thumbnail_url, is_premium, expert_name, exercise_count, exercises, published, sort_order)
VALUES (
    gen_random_uuid(),
    '${safeSlug}',
    '${safeTitle}',
    'routine',
    '${r.category}',
    '${r.category}',
    ${durSec},
    '${r.thumbnail}',
    '${r.thumbnail}',
    ${r.premium},
    '${safeExpert}',
    ${r.exerciseCount},
    '${safeJson}'::jsonb,
    true,
    ${idx}
);
`;
});

fs.writeFileSync('scripts/seed_utf8.sql', sql, 'utf8');
console.log('SQL seed written to scripts/seed_utf8.sql');
