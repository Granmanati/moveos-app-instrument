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


export const CATEGORIES = ['Pain Relief', 'Mobility', 'Strength', 'Recovery', 'Warmups', 'Protocols'] as const;


