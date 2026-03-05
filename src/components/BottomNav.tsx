import styles from './BottomNav.module.css';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, ListChecks, Compass, LineChart, User } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';

const NAV_ITEMS = [
    { path: '/', label: 'navHome' as const, Icon: LayoutGrid },
    { path: '/today', label: 'navToday' as const, Icon: ListChecks },
    { path: '/explore', label: 'navExplore' as const, Icon: Compass },
    { path: '/progress', label: 'navProgress' as const, Icon: LineChart },
    { path: '/profile', label: 'navProfile' as const, Icon: User },
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
                                strokeWidth={isActive ? 2.2 : 1.8}
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
