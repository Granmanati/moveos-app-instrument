import { useState, useEffect } from 'react';
import { safeSelect } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface ContentAsset {
    id: string;
    title: string;
    content_type: string;
    category: string;
    duration_seconds: number;
    thumbnail_url: string;
    is_premium: boolean;
    expert_name: string;
    exercise_count: number;
    exercises: any[]; // JSONB sequence
    published: boolean;
    sort_order: number;
}

export function useContentAssets() {
    const { user } = useAuth();
    const [assets, setAssets] = useState<ContentAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function fetchContent() {
            setLoading(true);
            try {
                // Fetch published routines
                const { data, error } = await safeSelect<ContentAsset>(
                    `
                    SELECT 
                        id, 
                        title, 
                        content_type, 
                        category, 
                        duration_seconds, 
                        thumbnail_url, 
                        is_premium, 
                        expert_name, 
                        exercise_count, 
                        exercises, 
                        published, 
                        sort_order
                    FROM content_assets
                    WHERE published = true AND content_type = 'routine'
                    ORDER BY sort_order ASC
                    `,
                    'ContentAssets'
                );

                if (cancelled) return;

                if (error) {
                    setError(error.message);
                } else {
                    setAssets(data || []);
                }
            } catch (err: any) {
                if (!cancelled) setError(err.message || 'Error fetching content');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchContent();
        return () => { cancelled = true; };
    }, [user]);

    // Helpers equivalent to old mock functions
    const getByCategory = (cat: string) => assets.filter(a => a.category === cat);
    const getForYou = () => assets.filter(a => !a.is_premium).slice(0, 4);
    const getById = (id: string) => assets.find(a => a.id === id);

    return {
        assets,
        loading,
        error,
        getByCategory,
        getForYou,
        getById,
    };

}
