import { useState, useRef } from 'react';
import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../data/exploreData';
import { useContentAssets, type ContentAsset } from '../hooks/useContentAssets';

const formatDuration = (sec: number) => `${Math.round(sec / 60)} MIN`;

const CollectionCard = ({ asset, onClick, locked }: { asset: ContentAsset; onClick: () => void; locked: boolean }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className="flex-shrink-0 w-44 flex flex-col gap-3 cursor-pointer"
    >
        <div className="aspect-[3/4] rounded-lg bg-[var(--mo-color-surface-secondary)] border-[0.5px] border-[var(--mo-color-border-subtle)] relative overflow-hidden group">
            <img src={asset.thumbnail_url} alt={asset.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-2 right-2">
                {locked && <Icon name="lock" size={14} className="text-[var(--mo-color-text-tertiary)]" />}
            </div>
            <div className="absolute bottom-2 left-2 flex gap-1">
                <span className="mono text-[8px] px-1.5 py-0.5 bg-[var(--mo-color-bg-primary)] text-[var(--mo-color-text-primary)] rounded-sm">
                    {formatDuration(asset.duration_seconds)}
                </span>
            </div>
        </div>
        <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-[var(--mo-color-text-primary)] line-clamp-1">{asset.title}</span>
            <span className="mono text-[9px] text-[var(--mo-color-text-tertiary)] uppercase tracking-wider">{asset.expert_name}</span>
        </div>
    </motion.div>
);

const SectionHeader = ({ title, sub }: { title: string; sub?: string }) => (
    <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col">
            <span className="mono text-[var(--mo-color-text-tertiary)] text-[9px] tracking-[0.2em]">{title.toUpperCase()}</span>
            {sub && <span className="text-xl font-light text-[var(--mo-color-text-primary)]">{sub}</span>}
        </div>
        <button className="mono text-[var(--mo-color-accent-system)] text-[9px] tracking-widest">SEE ALL</button>
    </div>
);

export default function ExplorePage() {
    const { tier } = useAuth();
    const navigate = useNavigate();
    const { loading, getByCategory, getForYou } = useContentAssets();
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef<HTMLInputElement>(null);

    const isLocked = (a: ContentAsset) => a.is_premium && tier === 'free';

    const openRoutine = (a: ContentAsset) => {
        if (isLocked(a)) { navigate('/pricing'); return; }
        navigate(`/explore/routine/${a.id}`);
    };

    return (
        <AppShell title="EXPLORE" sublabel="Movement Engineering Library">
            <div className="page-content micro-grid flex flex-col gap-10 pb-20">

                {/* Search Integration */}
                <div className="modular-frame py-3 px-4 bg-[var(--mo-color-surface-secondary)] flex items-center gap-3">
                    <Icon name="search" size={18} className="text-[var(--mo-color-text-tertiary)]" />
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="SEARCH PROTOCOLS, SYSTEMS..."
                        className="bg-transparent border-none outline-none flex-1 mono text-[11px] text-[var(--mo-color-text-primary)] placeholder:text-[var(--mo-color-text-tertiary)]"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--mo-color-border-subtle)] border-t-[var(--mo-color-accent-system)] animate-spin" />
                        <span className="mono text-[10px] text-[var(--mo-color-text-tertiary)]">INDEXING ASSETS...</span>
                    </div>
                ) : (
                    <>
                        {/* For You Highlight */}
                        <section className="flex flex-col">
                            <SectionHeader title="Recommendations" sub="Engineered for You" />
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {getForYou().map(a => (
                                    <CollectionCard key={a.id} asset={a} onClick={() => openRoutine(a)} locked={isLocked(a)} />
                                ))}
                            </div>
                        </section>

                        {/* Category Collections */}
                        {(CATEGORIES as unknown as string[]).map(cat => {
                            const items = getByCategory(cat);
                            if (!items.length) return null;
                            return (
                                <section key={cat} className="flex flex-col">
                                    <SectionHeader title="Collection" sub={cat} />
                                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                        {items.map(a => (
                                            <CollectionCard key={a.id} asset={a} onClick={() => openRoutine(a)} locked={isLocked(a)} />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </>
                )}
            </div>
        </AppShell>
    );
}
