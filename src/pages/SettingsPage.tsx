import { useState } from 'react';
import styles from './SettingsPage.module.css';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';


export default function SettingsPage() {
    const { setLanguage, lang } = useAuth();
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await supabase.auth.signOut();
            window.location.replace('/auth');
        } catch (error) {
            console.error('Logout error:', error);
            setLoggingOut(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const renderRow = (icon: string, label: string, action?: React.ReactNode) => (
        <div className={styles.settingsRow}>
            <div className={styles.rowInfo}>
                <div className={styles.rowIcon}><Icon name={icon} size={18} /></div>
                <span className={styles.rowLabel}>{label}</span>
            </div>
            <div className={styles.rowAction}>
                {action || <Icon name="chevron_right" size={18} className={styles.chevron} />}
            </div>
        </div>
    );

    return (
        <AppShell title="SETTINGS" sublabel="System configuration" hideNav>
            <div className={styles.page}>
                <button className={styles.backBtn} onClick={handleBack}>
                    <Icon name="arrow_back" size={20} />
                    <span>RETURN</span>
                </button>

                {/* Account */}
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Account</h3>
                    <div className={styles.rowGroup}>
                        {renderRow('mail', 'Email', <span className={styles.metaText}>system@node.loc</span>)}
                        {renderRow('language', 'Language',
                            <div className={styles.langSegment}>
                                <button
                                    className={`${styles.langBtn} ${lang === 'en' ? styles.langActive : ''}`}
                                    onClick={() => setLanguage('en')}
                                >
                                    EN
                                </button>
                                <button
                                    className={`${styles.langBtn} ${lang === 'es' ? styles.langActive : ''}`}
                                    onClick={() => setLanguage('es')}
                                >
                                    ES
                                </button>
                            </div>
                        )}
                        {renderRow('notifications', 'Notifications')}
                    </div>
                </section>

                {/* Preferences */}
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Preferences</h3>
                    <div className={styles.rowGroup}>
                        {renderRow('straighten', 'Units', <span className={styles.metaText}>Metric</span>)}
                        {renderRow('dark_mode', 'Theme', <span className={styles.metaText}>Dark</span>)}
                        {renderRow('volume_up', 'Sound', <span className={styles.metaText}>Enabled</span>)}
                    </div>
                </section>

                {/* Clinical Data */}
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Clinical Data</h3>
                    <div className={styles.rowGroup}>
                        {renderRow('healing', 'Injuries')}
                        {renderRow('show_chart', 'Pain History')}
                        {renderRow('accessibility_new', 'Movement Limitations')}
                    </div>
                </section>

                {/* Privacy */}
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Privacy</h3>
                    <div className={styles.rowGroup}>
                        {renderRow('security', 'Data Usage')}
                        {renderRow('file_download', 'Export Data')}
                        <div className={styles.settingsRow}>
                            <div className={styles.rowInfo}>
                                <div className={styles.rowIcon} style={{ color: 'var(--mo-color-state-alert)' }}>
                                    <Icon name="delete_forever" size={18} />
                                </div>
                                <span className={styles.rowLabel} style={{ color: 'var(--mo-color-state-alert)' }}>Delete Account</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* System */}
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>System</h3>
                    <div className={styles.rowGroup}>
                        {renderRow('info', 'MOVE OS Version', <span className={styles.metaText}>v1.2.0</span>)}
                        {renderRow('description', 'Terms & Conditions')}
                        {renderRow('policy', 'Privacy Policy')}
                    </div>
                </section>

                <div className={styles.footerBlock}>
                    <button className={styles.signOutBtn} onClick={handleLogout} disabled={loggingOut}>
                        {loggingOut ? <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} size={16} /> : <Icon name="power_settings_new" size={16} />}
                        <span>TERMINATE SESSION</span>
                    </button>
                </div>

            </div>
        </AppShell>
    );
}
