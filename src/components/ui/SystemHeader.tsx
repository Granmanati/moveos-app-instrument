

interface SystemHeaderProps {
    title?: string;
    sublabel?: string;
}

export function SystemHeader({ title, sublabel = "SYSTEM ACTIVE" }: SystemHeaderProps) {
    return (
        <div className="flex items-center justify-between w-full px-5 py-4 bg-[var(--mo-color-bg-primary)]">
            <div className="flex flex-col">
                <span className="text-[var(--mo-color-text-primary)] font-light tracking-[0.2em] text-sm">
                    MOVE OS
                </span>
                {sublabel && (
                    <span className="mono text-[var(--mo-color-text-tertiary)] text-[9px] mt-0.5">
                        {sublabel}
                    </span>
                )}
            </div>
            {title && (
                <span className="mono text-[var(--mo-color-text-secondary)] text-[10px]">
                    {title.toUpperCase()}
                </span>
            )}
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--mo-color-accent-system)] animate-pulse" />
            </div>
        </div>
    );
}
