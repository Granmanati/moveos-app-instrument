import { NavLink } from 'react-router-dom';
import { LayoutGrid, CalendarCheck2, LineChart, User, Compass } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';

const NAV_ITEMS = [
    { path: '/', label: 'Home', Icon: LayoutGrid },
    { path: '/explore', label: 'Explore', Icon: Compass },
    { path: '/mission', label: 'Mission', Icon: CalendarCheck2 },
    { path: '/progress', label: 'Progress', Icon: LineChart },
    { path: '/system', label: 'System', Icon: User },
];

export default function BottomNav() {
    const { t } = useI18n();

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[var(--mo-bottom-nav-height)] bg-[var(--mo-color-bg-primary)] border-t-[0.5px] border-t-[var(--mo-color-border-subtle)] px-6 flex items-center justify-between z-50 backdrop-blur-lg">
            {NAV_ITEMS.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                        `flex flex-col items-center gap-1.5 transition-all duration-200 ${isActive ? 'text-[var(--mo-color-accent-system)]' : 'text-[var(--mo-color-text-tertiary)] hover:text-[var(--mo-color-text-secondary)]'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <div className="relative">
                                <item.Icon
                                    size={20}
                                    strokeWidth={isActive ? 2 : 1.5}
                                    className="transition-all"
                                />
                                {isActive && (
                                    <div className="absolute -top-1 -right-1 w-1 h-1 bg-[var(--mo-color-accent-system)] rounded-full animate-pulse" />
                                )}
                            </div>
                            <span className="mono text-[8px] tracking-widest uppercase">
                                {t(item.label as any)}
                            </span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
