import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { Card, CardLabel, CardTitle } from '../components/ui/Card';

const CollectionCard = ({
    title,
    items,
    type,
}: {
    title: string;
    items: number;
    type: string;
}) => (
    <Card className="min-w-[240px] max-w-[240px] p-0 overflow-hidden bg-[var(--mo-color-surface-secondary)]">
        <div className="h-32 bg-[var(--mo-color-border-subtle)] relative overflow-hidden">
            {/* Placeholder for real generative imagery */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--mo-color-accent-system)]/10 to-transparent" />
            <div className="absolute bottom-4 left-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--mo-color-bg-primary)]/80 backdrop-blur-sm border-[0.5px] border-white/10 flex items-center justify-center">
                    <Icon name="explore" size={18} className="text-white" />
                </div>
            </div>
        </div>
        <div className="p-4 flex flex-col gap-1">
            <CardLabel>{type}</CardLabel>
            <CardTitle>{title}</CardTitle>
            <span className="mono text-[8px] text-[var(--mo-color-text-tertiary)] uppercase tracking-widest mt-1">{items} PROTOCOLS UNLOCKED</span>
        </div>
    </Card>
);

const CategoryChip = ({ label, active = false }: { label: string; active?: boolean }) => (
    <div className={`px-4 py-2 rounded-full border-[0.5px] transition-all whitespace-nowrap cursor-pointer ${active
        ? 'bg-[var(--mo-color-accent-system)] border-[var(--mo-color-accent-system)] text-white shadow-[var(--mo-shadow-button)]'
        : 'bg-[var(--mo-color-surface-primary)] border-[var(--mo-color-border-subtle)] text-[var(--mo-color-text-secondary)] hover:border-[var(--mo-color-border-strong)]'
        }`}>
        <span className="text-[13px] font-medium tracking-tight">{label}</span>
    </div>
);

export default function ExplorePage() {

    return (
        <AppShell title="EXPLORE" sublabel="CURATED MOVEMENT LIBRARY">
            <div className="page-content !px-0">

                {/* 1. Search & Filter Foundation */}
                <div className="px-[var(--mo-screen-padding-x)] flex flex-col gap-6 pt-2">
                    <div className="flex flex-col gap-2">
                        <span className="mono text-[10px] text-[var(--mo-color-text-tertiary)] font-bold tracking-widest uppercase">DISCOVERY ENGINE</span>
                        <h1 className="text-[32px] font-semibold tracking-tight text-[var(--mo-color-text-primary)]">Curated.</h1>
                    </div>

                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mo-color-text-tertiary)]">
                            <Icon name="search" size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Unlock protocols by keyword..."
                            className="w-full h-[52px] bg-[var(--mo-color-surface-secondary)] border-[0.5px] border-[var(--mo-color-border-subtle)] rounded-[16px] pl-12 pr-4 text-sm focus:outline-none focus:border-[var(--mo-color-accent-system)] transition-colors"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1">
                        <CategoryChip label="All Patterns" active={true} />
                        <CategoryChip label="Mobility" />
                        <CategoryChip label="Stability" />
                        <CategoryChip label="Strength" />
                        <CategoryChip label="Neuromuscular" />
                    </div>
                </div>

                {/* 2. Horizontal Collections */}
                <div className="flex flex-col gap-8 mt-4">

                    {/* Collection One */}
                    <div className="flex flex-col gap-4">
                        <div className="px-[var(--mo-screen-padding-x)] flex justify-between items-end">
                            <span className="text-[18px] font-semibold text-[var(--mo-color-text-primary)]">Foundational Series</span>
                            <span className="mono text-[10px] text-[var(--mo-color-accent-system)] font-bold cursor-pointer">SEE ALL</span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto px-[var(--mo-screen-padding-x)] pb-4 scrollbar-hide">
                            <CollectionCard title="Postural Alignment" items={8} type="STABILITY" />
                            <CollectionCard title="Core Integrated" items={12} type="NEUROMUSCULAR" />
                            <CollectionCard title="Hip Mechanics" items={6} type="MOBILITY" />
                        </div>
                    </div>

                    {/* Collection Two */}
                    <div className="flex flex-col gap-4">
                        <div className="px-[var(--mo-screen-padding-x)] flex justify-between items-end">
                            <span className="text-[18px] font-semibold text-[var(--mo-color-text-primary)]">Adaptive Specialized</span>
                            <span className="mono text-[10px] text-[var(--mo-color-accent-system)] font-bold cursor-pointer">SEE ALL</span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto px-[var(--mo-screen-padding-x)] pb-4 scrollbar-hide">
                            <CollectionCard title="Pain Reduction 101" items={4} type="CLINICAL" />
                            <CollectionCard title="Lower Back Relief" items={7} type="ADAPTIVE" />
                            <CollectionCard title="Neck Release Flow" items={5} type="RECOVERY" />
                        </div>
                    </div>

                </div>

            </div>
        </AppShell>
    );
}
