import styles from './ProfilePage.module.css';
import { mockData } from '../data/mockData';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const planColors: Record<string, string> = {
    Free: '#8A8A96',
    Premium: '#FFB020',
    Pro: '#2D7CFF',
    Admin: '#FF4D4D',
};

export default function ProfilePage() {
    const { user, profile } = mockData;
    const planColor = planColors[profile.plan] || planColors.Free;
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/auth');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AppShell
            customHeader={
                <header className={styles.header}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <p style={{ fontSize: '12px', letterSpacing: '1.2px', color: '#2D7CFF', fontWeight: 700, margin: 0, paddingBottom: '16px', textTransform: 'uppercase' }}>MOVE OS</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className={styles.avatarLarge}>
                                <Icon name="person" size={36} />
                            </div>
                            <div className={styles.userInfo}>
                                <h1 className={styles.name}>{user.name}</h1>
                                <span className={styles.planBadge} style={{ color: planColor, borderColor: planColor }}>
                                    {profile.plan}
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
                    <span className={styles.statValue}>{profile.totalSessions}</span>
                    <span className={styles.statLabel}>Sesiones</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{profile.adherenceAvg}%</span>
                    <span className={styles.statLabel}>Adherencia</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{profile.painAvg}</span>
                    <span className={styles.statLabel}>Dolor medio</span>
                </div>
            </section>

            {/* Plan info */}
            {profile.plan === 'Free' && (
                <section className={styles.section}>
                    <div className={styles.upgradeCard}>
                        <div className={styles.upgradeHeader}>
                            <Icon name="workspace_premium" style={{ color: '#FFB020' }} size={22} />
                            <h2 className={styles.upgradeTitle}>Acceso Premium</h2>
                        </div>
                        <p className={styles.upgradeText}>
                            Desbloquea biblioteca completa, ajuste de carga avanzado y seguimiento de dolor detallado.
                        </p>
                        <button className={styles.upgradeBtn} onClick={() => navigate('/pricing')}>Ver planes</button>
                    </div>
                </section>
            )}

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
                <button className={styles.signOutBtn} onClick={handleLogout}>
                    <Icon name="logout" />
                    Cerrar sesión
                </button>
                <p className={styles.version}>MOVE OS · v0.1.0 · Fase {profile.phase}</p>
            </section>
        </AppShell>
    );
}
