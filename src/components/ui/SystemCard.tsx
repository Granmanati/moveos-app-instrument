import React from 'react';
import styles from './SystemCard.module.css';

interface SystemCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    interactive?: boolean;
}

export function SystemCard({
    children,
    className = '',
    padding = 'md',
    interactive = false,
    ...props
}: SystemCardProps) {
    const cardClass = [
        styles.card,
        styles[`pad-${padding}`],
        interactive ? styles.interactive : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={cardClass} {...props}>
            {children}
        </div>
    );
}
