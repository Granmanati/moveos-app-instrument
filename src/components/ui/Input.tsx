import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    fullWidth?: boolean;
}

export function Input({ className = '', fullWidth = true, ...props }: InputProps) {
    const inputClass = [
        styles.input,
        fullWidth ? styles.fullWidth : '',
        className
    ].filter(Boolean).join(' ');

    return <input className={inputClass} {...props} />;
}
