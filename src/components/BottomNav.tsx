import styles from './BottomNav.module.css';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, ListChecks, LineChart, User, Compass } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';

const NAV_ITEMS = [
    { path: '/', label: 'Home' as any, Icon: LayoutGrid },
    { path: '/explore', label: 'Explore' as any, Icon: Compass },
    { path: '/mission', label: 'Mission' as any, Icon: ListChecks },
    { path: '/progress', label: 'navProgress' as const, Icon: LineChart },
    { path: '/profile', label: 'Profile' as any, Icon: User },
];

export default function BottomNav() {
    const { t } = useI18n();

    return (
        <nav className={styles.nav}>
            {NAV_ITEMS.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                        `${styles.tab} ${isActive ? styles.active : ''}`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <item.Icon
                                size={22}
                                strokeWidth={1.5}
                                className={`${styles.icon} ${isActive ? styles.iconActive : ''}`}
                            />
                            <span className={styles.label}>{t(item.label)}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
