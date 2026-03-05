import React from 'react';
import styles from './PrimaryButton.module.css';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    fullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function PrimaryButton({
    children,
    className = '',
    fullWidth = true,
    size = 'md',
    ...props
}: PrimaryButtonProps) {
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
