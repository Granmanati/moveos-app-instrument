import { useEffect, useState } from 'react';
import styles from './ProfilePage.module.css';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const planColors: Record<string, string> = {
    free: '#8A8A96',
    premium: '#FFB020',
    pro: '#2D7CFF',
    admin: '#FF4D4D',
};

export default function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [tier, setTier] = useState<string>('free');
    const [stats, setStats] = useState({ sessions: 0, adherence: 0, pain: 0 });
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user) return;
            try {
                // Tier
                const { data: subData } = await supabase
                    .from('subscription_status')
                    .select('tier')
                    .eq('user_id', user.id)
                    .maybeSingle();
                if (subData) setTier(subData.tier);

                // Quick stats via rpc (reusing home snapshot)
                const { data: homeData } = await supabase.rpc('get_home_snapshot');
                if (homeData) {
                    setStats({
                        sessions: homeData.sessions_30d || 0,
                        adherence: homeData.adherence_7d || 0,
                        pain: typeof homeData.avg_pain_7d === 'number' ? Number(homeData.avg_pain_7d.toFixed(1)) : 0
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [user]);

    const planColor = planColors[tier] || planColors.free;

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await supabase.auth.signOut();
            window.location.replace('/auth'); // Hard replace to clear all states immediately
        } catch (error) {
            console.error('Logout error:', error);
            setLoggingOut(false);
        }
    };

    return (
        <AppShell
            customHeader={
                <header className={styles.header}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <p className={styles.systemLabel}>MOVE OS • v0.1.0</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className={styles.avatarLarge}>
                                <Icon name="person" size={32} />
                            </div>
                            <div className={styles.userInfo}>
                                <h1 className={styles.name}>{user?.user_metadata?.full_name || 'System User'}</h1>
                                <span className={styles.planBadge} style={{ color: planColor, borderColor: planColor }}>
                                    {tier}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>
            }
        >
            {/* Stats */}
            <section className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIconBadge}>
                        <Icon name="data_usage" className={styles.statIcon} size={20} />
                    </div>
                    <span className={styles.statValue}>{loading ? '-' : stats.sessions}</span>
                    <span className={styles.statLabel}>Sesiones</span>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIconBadge}>
                        <Icon name="event_available" className={styles.statIcon} size={20} />
                    </div>
                    <span className={styles.statValue}>{loading ? '-' : `${stats.adherence}%`}</span>
                    <span className={styles.statLabel}>Adherencia</span>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIconBadge}>
                        <Icon name="healing" className={styles.statIcon} size={20} />
                    </div>
                    <span className={styles.statValue}>{loading ? '-' : stats.pain}</span>
                    <span className={styles.statLabel}>Dolor medio</span>
                </div>
            </section>

            {/* Plan info */}
            <section className={styles.section}>
                {tier === 'free' ? (
                    <div className={styles.upgradeCard}>
                        <div className={styles.upgradeHeader}>
                            <Icon name="workspace_premium" style={{ color: '#FFB020' }} size={22} />
                            <h2 className={styles.upgradeTitle}>Unlock Premium</h2>
                        </div>
                        <ul className={styles.upgradeList}>
                            <li>Full execution library</li>
                            <li>Adaptive clinical engine</li>
                            <li>Advanced insights</li>
                        </ul>
                        <button className={styles.upgradeBtn} onClick={() => navigate('/pricing')}>Start 7-day trial</button>
                        <button className={styles.ghostBtn} onClick={() => navigate('/pricing')}>View plans</button>
                    </div>
                ) : (
                    <div className={styles.activePlanCard}>
                        <div className={styles.upgradeHeader}>
                            <Icon name="workspace_premium" style={{ color: '#2D7CFF' }} size={22} />
                            <h2 className={styles.upgradeTitle}>Subscription</h2>
                            <span className={styles.statusLine}>Active</span>
                        </div>
                        <button className={styles.manageBtn} onClick={() => navigate('/pricing')}>Manage subscription</button>
                    </div>
                )}
            </section>

            {/* Settings list */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Configuración</h2>
                <div className={styles.settingsList}>
                    {[
                        { icon: 'manage_accounts', label: 'Datos personales' },
                        { icon: 'notifications', label: 'Notificaciones' },
                        { icon: 'local_hospital', label: 'Historial clínico' },
                        { icon: 'shield', label: 'Privacidad y datos' },
                    ].map((item) => (
                        <button key={item.label} className={styles.settingsRow}>
                            <div className={styles.settingsIcon}>
                                <Icon name={item.icon} size={20} />
                            </div>
                            <span className={styles.settingsLabel}>{item.label}</span>
                            <Icon name="chevron_right" style={{ color: 'var(--text-muted)' }} size={18} />
                        </button>
                    ))}
                </div>
            </section>

            {/* Sign out */}
            <section className={styles.section}>
                <button className={styles.signOutBtn} onClick={handleLogout} disabled={loggingOut}>
                    {loggingOut ? <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} /> : <Icon name="logout" />}
                    {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                </button>
            </section>
        </AppShell>
    );
}
