import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    rightElement?: React.ReactNode;
}

export function PageHeader({ title, subtitle, showBack, rightElement }: PageHeaderProps) {
    const navigate = useNavigate();

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                {showBack && (
                    <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Volver">
                        <ArrowLeft size={24} />
                    </button>
                )}
                <div className={styles.titles}>
                    <h1 className={styles.title}>{title}</h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
            </div>
            {rightElement && <div className={styles.right}>{rightElement}</div>}
        </header>
    );
}
