import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type Tier = 'free' | 'premium' | 'pro';

export function useTier() {
    const { user } = useAuth();
    const [tier, setTier] = useState<Tier>('free');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTier = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await supabase
                    .from('subscription_status')
                    .select('tier')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (data && data.tier) {
                    setTier(data.tier as Tier);
                }
            } catch (err) {
                console.error('Error fetching tier:', err);
                setTier('free');
            } finally {
                setLoading(false);
            }
        };

        fetchTier();
    }, [user]);

    return {
        tier,
        isFree: tier === 'free',
        isPremium: tier === 'premium',
        isPro: tier === 'pro',
        loading
    };
}
