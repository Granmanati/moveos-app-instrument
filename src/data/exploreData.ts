// Central mock data + types shared across Explore screens

export interface Exercise {
    id: string;
    name: string;
    sets: number;
    duration: string; // e.g. "30 sec"
    thumbnail: string;
}

export interface Routine {
    id: string;
    title: string;
    duration: string;
    category: string;
    expert: string;
    thumbnail: string;
    exerciseCount: number;
    premium: boolean;
    exercises: Exercise[];
}

const THUMBS = [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=70',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=70',
    'https://images.unsplash.com/photo-1590987337591-47bcd1f4f69b?w=400&q=70',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&q=70',
];

const makeExercises = (names: string[]): Exercise[] =>
    names.map((name, i) => ({
        id: `ex-${i}`,
        name,
        sets: 3,
        duration: `${20 + i * 5} sec`,
        thumbnail: THUMBS[i % THUMBS.length],
    }));

export const ROUTINES: Routine[] = [
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

export const CATEGORIES = ['Pain Relief', 'Mobility', 'Strength', 'Recovery', 'Warmups', 'Protocols'] as const;

export const getByCategory = (cat: string) => ROUTINES.filter(r => r.category === cat);
export const getForYou = () => ROUTINES.filter(r => !r.premium).slice(0, 4);
