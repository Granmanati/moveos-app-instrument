

interface SystemHeaderProps {
    title?: string;
    sublabel?: string;
}

export function SystemHeader({ title, sublabel = "PULSE_ACTIVE" }: SystemHeaderProps) {
    return (
        <header className="flex items-center justify-between w-full px-5 pt-6 pb-4 bg-[var(--mo-color-bg-primary)]">
            <div className="flex flex-col gap-0.5">
                <span className="text-[var(--mo-color-text-tertiary)] font-light tracking-[0.2em] text-[10px]">
                    MOVE OS
                </span>
                <h1 className="text-[var(--mo-color-text-primary)] font-semibold text-lg tracking-tight">
                    {title || 'HOME'}
                </h1>
            </div>

            <div className="flex items-center gap-2.5 bg-[var(--mo-color-surface-secondary)] px-3 py-1.5 rounded-full border-[0.5px] border-[var(--mo-color-border-subtle)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--mo-color-accent-system)] animate-pulse shadow-[0_0_8px_var(--mo-color-accent-system)]" />
                <span className="mono text-[var(--mo-color-text-secondary)] text-[9px] font-bold tracking-widest uppercase">
                    {sublabel}
                </span>
            </div>
        </header>
    );
}
