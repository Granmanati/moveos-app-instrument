import React from 'react';
import styles from './SecondaryButton.module.css';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    fullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function SecondaryButton({
    children,
    className = '',
    fullWidth = true,
    size = 'md',
    ...props
}: SecondaryButtonProps) {
    const btnClass = [
        styles.btn,
        fullWidth ? styles.fullWidth : '',
        styles[`size-${size}`],
        className
    ].filter(Boolean).join(' ');

    return (
        <button className={btnClass} {...props}>
            {children}
        </button>
    );
}
