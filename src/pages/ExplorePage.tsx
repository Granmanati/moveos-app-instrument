import { useEffect, useState } from 'react';
import styles from './ExplorePage.module.css';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';

const CATEGORIES = ['Todos', 'squat', 'hinge', 'push', 'pull', 'carry', 'regulate'];

export default function ExplorePage() {
    const { user } = useAuth();

    // UI States
    const [viewState, setViewState] = useState<'loading' | 'error' | 'empty' | 'success'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    const [library, setLibrary] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);

    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [mutedVideos, setMutedVideos] = useState<Record<string, boolean>>({});

    const toggleMute = (id: string) => {
        setMutedVideos(prev => ({ ...prev, [id]: prev[id] === false }));
    };

    const fetchExploreData = async () => {
        if (!user) return;
        setViewState('loading');
        setErrorMsg('');

        try {
            // Fetch subscription tier
            const { data: subData, error: subError } = await supabase
                .from('subscription_status')
                .select('tier')
                .eq('user_id', user.id)
                .maybeSingle();

            if (subError) throw subError;
            setSubscription(subData || { tier: 'free' });

            // Fetch library
            const { data: exData, error: exError } = await supabase
                .from('exercise_library')
                .select('*')
                .order('name');

            if (exError) throw exError;

            if (exData && exData.length > 0) {
                setLibrary(exData);
                setViewState('success');
            } else {
                setLibrary([]);
                setViewState('empty');
            }

        } catch (err: any) {
            console.error('Explore error:', err);
            setErrorMsg(err.message || 'Error cargando la biblioteca.');
            setViewState('error');
        }
    };

    useEffect(() => {
        fetchExploreData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const filtered = library.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'Todos' || item.pattern === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const isLocked = (item: any) => {
        const isPremiumEx = item.is_premium;
        const userTier = subscription?.tier || 'free';
        return (isPremiumEx && userTier === 'free');
    };

    return (
        <AppShell
            customHeader={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', paddingBottom: 'var(--sp-2)' }}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>Biblioteca de ejecución</h1>
                        <p className={styles.subtitle}>Patrones clínicos y rutinas</p>
                    </header>

                    <div className={styles.searchBar}>
                        <Icon name="search" size={18} style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar patrón..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className={styles.clearBtn}>
                                <Icon name="close" size={18} />
                            </button>
                        )}
                    </div>

                    <div className={styles.filterRow}>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                className={`${styles.filterChip} ${activeCategory === cat ? styles.filterActive : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            }
        >
            {/* Scrollable Content Area */}
            <div style={{ scrollSnapType: 'y mandatory', display: 'flex', flexDirection: 'column' }}>
                {viewState === 'loading' && (
                    <div style={{ display: 'flex', flexDirection: 'column', padding: 'var(--sp-8) 0', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                        <Icon name="autorenew" style={{ animation: 'spin 1s linear infinite' }} size={32} />
                        <p style={{ marginTop: '16px', fontSize: '14px' }}>Cargando catálogo...</p>
                    </div>
                )}

                {viewState === 'error' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--sp-8) var(--sp-4)', gap: '16px' }}>
                        <Icon name="error" style={{ color: 'var(--warning)' }} size={48} />
                        <h2 style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>Error de Sistema</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{errorMsg}</p>
                        <button
                            onClick={fetchExploreData}
                            style={{ marginTop: '16px', padding: '12px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {viewState === 'empty' && (
                    <div className={styles.emptyState}>
                        <Icon name="video_library" size={48} />
                        <p>El catálogo está vacío actualmente.</p>
                    </div>
                )}

                {viewState === 'success' && filtered.length === 0 && (
                    <div className={styles.emptyState}>
                        <Icon name="search_off" size={48} />
                        <p>No hay resultados para tu búsqueda. Ajusta los filtros.</p>
                    </div>
                )}

                {viewState === 'success' && filtered.length > 0 && (
                    <div className={styles.grid}>
                        {filtered.map((item) => {
                            const locked = isLocked(item);
                            return (
                                <div key={item.id} className={`${styles.videoCard} ${locked ? styles.locked : ''}`}>
                                    <div className={styles.videoContainer}>
                                        {item.media_video_url ? (
                                            <video src={item.media_video_url} playsInline muted={mutedVideos[item.id] !== false} loop autoPlay preload="metadata" className={styles.thumbnailVideo} />
                                        ) : (
                                            <div className={styles.thumbnailPlaceholder}>
                                                <Icon name="play_circle" style={{ color: 'rgba(255,255,255,0.5)' }} size={48} />
                                            </div>
                                        )}
                                        {/* Scrim for text readability */}
                                        <div className={styles.scrim}></div>

                                        {/* Top indicators */}
                                        <div className={styles.topRow}>
                                            <div className={styles.patternChip}>{item.pattern || 'Movement'}</div>
                                            {item.media_video_url && (
                                                <button className={styles.muteToggle} onClick={(e) => { e.stopPropagation(); toggleMute(item.id); }}>
                                                    <Icon name={mutedVideos[item.id] !== false ? "volume_off" : "volume_up"} size={18} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Overlay Content (Bottom) */}
                                        <div className={styles.overlayContent}>
                                            <div className={styles.clinicalCues}>
                                                <div className={styles.cue}><Icon name="info" size={14} /> <span>Focus: Neutral Spine</span></div>
                                            </div>

                                            <h3 className={styles.cardTitle}>{item.name}</h3>

                                            {(item.sets || item.reps || item.rest_seconds) && (
                                                <div className={styles.metaPillRow}>
                                                    {item.sets && <span className={styles.metaPill}>{item.sets} Sets</span>}
                                                    {item.reps && <span className={styles.metaPill}>{item.reps} Reps</span>}
                                                    {item.rest_seconds && <span className={styles.metaPill}>{item.rest_seconds}s Rest</span>}
                                                </div>
                                            )}
                                        </div>

                                        {locked && (
                                            <div className={styles.lockOverlay}>
                                                <Icon name="lock" size={32} />
                                                <span>PRO</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
