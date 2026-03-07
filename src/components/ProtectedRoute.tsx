import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from './Icon';

export default function ProtectedRoute() {
    const { user, profile, isLoading, tier, paywallDismissedUntil } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} size={32} />
            </div>
        );
    }

    // Si no hay usuario, redirigir al login
    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Si no hay perfil aún cargado, no hacemos redirect para no causar fliqueos
    if (!profile) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} size={32} />
            </div>
        );
    }

    // Si existe perfil pero no ha completado onboarding
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
