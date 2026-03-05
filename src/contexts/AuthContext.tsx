import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { setFallbackLang } from '../i18n/strings';
import type { Lang } from '../i18n/strings';

export type SubscriptionTier = 'free' | 'premium' | 'pro';
export type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'canceled';

export interface UserProfile {
    user_id: string;
    full_name?: string;
    current_phase?: string;
    assigned_phase?: string;
    role?: string;
    onboarding_completed?: boolean;
    onboarding_version?: string;
    preferred_language?: Lang;
    subscription_tier?: SubscriptionTier;
    subscription_status?: SubscriptionStatus;
    trial_started_at?: string | null;
    trial_ends_at?: string | null;
    [key: string]: any;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    tier: SubscriptionTier;
    subscriptionStatus: SubscriptionStatus;
    trialEndsAt: Date | null;
    trialDaysLeft: number;
    lang: Lang;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    startTrial: () => Promise<void>;
    setLanguage: (lang: Lang) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Derived tier state
    const tier: SubscriptionTier = (profile?.subscription_tier as SubscriptionTier) || 'free';
    const subscriptionStatus: SubscriptionStatus = (profile?.subscription_status as SubscriptionStatus) || 'free';
    const trialEndsAt: Date | null = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
    const trialDaysLeft = trialEndsAt
        ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;
    const lang: Lang = (profile?.preferred_language as Lang) ||
        (localStorage.getItem('moveos_lang') as Lang) || 'en';

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setIsLoading(false);
            }
        });

        return () => { subscription.unsubscribe(); };
    }, []);

    // Sync lang to i18n system whenever profile changes
    useEffect(() => {
        if (profile?.preferred_language) {
            setFallbackLang(profile.preferred_language as Lang);
        }
    }, [profile?.preferred_language]);

    const fetchProfile = async (userId: string) => {
        try {
            // Refresh subscription state (expire stale trials) first
            const { data: refreshedData } = await supabase.rpc('refresh_subscription_state');
            if (refreshedData) {
                // The RPC returns updated fields, but we still fetch full profile
            }

            const { data, error } = await supabase
                .from('user_profile')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (!error && data) {
                setProfile(data as UserProfile);
                // Sync lang fallback
                if (data.preferred_language) {
                    setFallbackLang(data.preferred_language as Lang);
                }
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const refreshProfile = async () => {
        if (user?.id) {
            await fetchProfile(user.id);
        }
    };

    const startTrial = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase.rpc('start_trial');
            if (error) throw error;
            // Re-fetch profile to get updated fields
            await fetchProfile(user.id);
            console.log('Trial started:', data);
        } catch (err) {
            console.error('Error starting trial:', err);
            throw err;
        }
    };

    const setLanguage = async (newLang: Lang) => {
        // Update local state immediately for responsiveness
        setFallbackLang(newLang);
        if (profile) {
            setProfile((prev) => prev ? { ...prev, preferred_language: newLang } : prev);
        }
        // Persist to DB if logged in
        if (user) {
            try {
                await supabase.rpc('set_language', { lang: newLang });
            } catch (err) {
                console.error('Error setting language:', err);
            }
        }
    };

    const value: AuthContextType = {
        session,
        user,
        profile,
        isLoading,
        tier,
        subscriptionStatus,
        trialEndsAt,
        trialDaysLeft,
        lang,
        signOut,
        refreshProfile,
        startTrial,
        setLanguage,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
