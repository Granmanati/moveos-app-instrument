import styles from './BottomNav.module.css';
import { NavLink } from 'react-router-dom';
import { Icon } from './Icon';

interface NavItem {
    readonly path: string;
    readonly label: string;
    readonly icon: string;
}

const NAV_ITEMS: readonly NavItem[] = [
    { path: '/', label: 'Home', icon: 'space_dashboard' },
    { path: '/today', label: 'Today', icon: 'checklist' },
    { path: '/explore', label: 'Explore', icon: 'explore' },
    { path: '/progress', label: 'Progress', icon: 'monitoring' },
    { path: '/profile', label: 'Profile', icon: 'person' },
];

export default function BottomNav() {
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
                            <Icon name={item.icon} active={isActive} className={styles.iconOverride} />
                            <span className={styles.label}>{item.label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
