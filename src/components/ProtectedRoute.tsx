import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppShell from './AppShell';
import { Skeleton, SkeletonCard } from './ui/Skeleton';

export default function ProtectedRoute() {
    const { user, profile, isLoading, tier, paywallDismissedUntil } = useAuth();
    const location = useLocation();

    // If not loading and no user, strictly redirect to auth to prevent layout flash
    if (!isLoading && !user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Premium Startup Pre-Render
    if (isLoading || !profile) {
        return (
            <AppShell title="SYSTEM" sublabel="NODE_INITIALIZING" hideNav={true}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'var(--mo-space-8)', marginTop: '10vh' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '1.2px', color: 'var(--primary)', fontWeight: 600, animation: 'pulse 1.5s infinite ease-in-out' }}>SYSTEM INITIALIZING</div>
                        <Skeleton width={180} height={20} borderRadius="var(--radius-full)" />
                    </div>
                    <SkeletonCard style={{ height: 160 }} />
                    <SkeletonCard style={{ height: 120 }} />
                </div>
            </AppShell>
        );
    }

    // Si existe perfil pero no ha completado onboarding
    // At this point, profile is guaranteed to exist due to the previous check
    if (profile.onboarding_completed === false) {
        if (location.pathname !== '/onboarding') {
            return <Navigate to="/onboarding" replace />;
        }
    } else if (location.pathname === '/onboarding') {
        // Si ya lo completó pero intenta ir a onboarding por url, lo mandamos al home
        return <Navigate to="/" replace />;
    }

    // Paywall Gate for Free Tier
    if (tier === 'free' && location.pathname !== '/pricing') {
        const now = new Date();
        const needsPaywall = !paywallDismissedUntil || paywallDismissedUntil < now;
        if (needsPaywall) {
            return <Navigate to="/pricing" state={{ from: location }} replace />;
        }
    }

    return <Outlet />;
}
