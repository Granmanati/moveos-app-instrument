import AppShell from '../components/AppShell';
import { Icon } from '../components/Icon';
import { Card, CardLabel } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';

const ProtocolNode = ({
    type,
    title,
    duration,
    status = 'pending',
    isActive = false
}: {
    type: string;
    title: string;
    duration: string;
    status?: 'complete' | 'active' | 'pending';
    isActive?: boolean;
}) => (
    <div className={`relative flex items-start gap-5 ${status === 'pending' ? 'opacity-60' : 'opacity-100'}`}>
        <div className="flex flex-col items-center pt-1.5">
            <div className={`w-3 h-3 rounded-full border-2 transition-colors ${status === 'complete' ? 'bg-[var(--mo-color-state-aligned)] border-[var(--mo-color-state-aligned)]' :
                status === 'active' ? 'bg-[var(--mo-color-accent-system)] border-[var(--mo-color-accent-system)] scale-125' :
                    'bg-transparent border-[var(--mo-color-border-strong)]'
                }`} />
            <div className="w-[1px] h-20 bg-[var(--mo-color-border-subtle)] mt-2" />
        </div>
        <Card className={`flex-1 ${isActive ? 'border-[var(--mo-color-accent-system)] ring-1 ring-[var(--mo-color-accent-system)]' : ''}`}>
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <CardLabel>{type}</CardLabel>
                    <h5 className="text-[16px] font-semibold text-[var(--mo-color-text-primary)]">{title}</h5>
                </div>
                <span className="mono text-[9px] text-[var(--mo-color-text-tertiary)]">{duration}</span>
            </div>
            {status === 'active' && (
                <div className="flex items-center gap-2 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--mo-color-accent-system)] animate-pulse" />
                    <span className="mono text-[8px] text-[var(--mo-color-accent-system)] font-bold">READY TO EXECUTE</span>
                </div>
            )}
        </Card>
    </div>
);

export default function MissionPage() {
    const navigate = useNavigate();

    return (
        <AppShell title="TODAY" sublabel="PROTOCOL PIPELINE EXECUTION">
            <div className="page-content">

                {/* 1. Header Logic */}
                <div className="flex flex-col gap-2 pt-2">
                    <span className="mono text-[10px] text-[var(--mo-color-accent-system)] font-bold tracking-widest">CURRENT PHASE: ADAPTIVE</span>
                    <h1 className="text-[32px] font-semibold tracking-tight text-[var(--mo-color-text-primary)]">Daily Mission.</h1>
                    <p className="text-[14px] text-[var(--mo-color-text-secondary)] mt-1">
                        System state is **Stable**. Executing standard load distribution for Monday.
                    </p>
                </div>

                {/* 2. Timeline Sections */}
                <div className="flex flex-col mt-4">
                    <ProtocolNode
                        type="BLOCK A: PREPARATION"
                        title="Neuro-Muscular Priming"
                        duration="04:00"
                        status="complete"
                    />
                    <ProtocolNode
                        type="BLOCK B: CORE"
                        title="Stability Foundations"
                        duration="08:00"
                        status="active"
                        isActive={true}
                    />
                    <ProtocolNode
                        type="BLOCK C: CAPACITY"
                        title="Integrated Moveflow"
                        duration="06:00"
                        status="pending"
                    />
                    <ProtocolNode
                        type="BLOCK D: RECOVERY"
                        title="System Reset & Mobility"
                        duration="04:00"
                        status="pending"
                    />
                </div>

                {/* 3. Global Action */}
                <div className="fixed bottom-[var(--mo-bottom-nav-height)] left-0 right-0 p-[var(--mo-screen-padding-x)] bg-gradient-to-t from-[var(--mo-color-bg-primary)] via-[var(--mo-color-bg-primary)] to-transparent pt-12 z-[var(--mo-z-base)]">
                    <div className="max-w-[var(--mo-screen-max-width)] mx-auto">
                        <button
                            onClick={() => navigate('/session')}
                            className="w-full h-[52px] bg-[var(--mo-color-accent-system)] text-white rounded-[16px] font-semibold flex items-center justify-center gap-2 shadow-[var(--mo-shadow-button)] active:scale-[0.98] transition-all"
                        >
                            <Icon name="play_arrow" size={20} />
                            <span>CONTINUE PROTOCOL</span>
                        </button>
                    </div>
                </div>

            </div>
        </AppShell>
    );
}
