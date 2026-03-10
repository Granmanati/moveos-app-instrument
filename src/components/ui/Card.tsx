import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card = ({ children, className = '', onClick }: CardProps) => (
    <div
        onClick={onClick}
        className={`modular-frame p-5 flex flex-col gap-4 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-all' : ''} ${className}`}
    >
        {children}
    </div>
);

export const CardLabel = ({ children, color = 'var(--mo-color-text-tertiary)' }: { children: React.ReactNode; color?: string }) => (
    <span className="mono text-[9px] font-bold tracking-[0.12em]" style={{ color }}>
        {children}
    </span>
);

export const CardTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-[18px] font-semibold leading-tight text-[var(--mo-color-text-primary)]">
        {children}
    </h3>
);

export const CardBody = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[14px] leading-relaxed text-[var(--mo-color-text-secondary)]">
        {children}
    </p>
);

export const CardFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`mt-2 flex items-center justify-between border-t-[0.5px] border-t-[var(--mo-color-border-subtle)] pt-4 ${className}`}>
        {children}
    </div>
);
