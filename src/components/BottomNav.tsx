import { NavLink } from 'react-router-dom';
import { Icon } from './Icon';

const NAV_ITEMS = [
    { id: 'home', path: '/', label: 'Home', icon: 'home' },
    { id: 'explore', path: '/explore', label: 'Explore', icon: 'explore' },
    { id: 'mission', path: '/mission', label: 'Today', icon: 'play_arrow' },
    { id: 'progress', path: '/progress', label: 'Progress', icon: 'bar_chart' },
    { id: 'profile', path: '/system', label: 'Profile', icon: 'person' }
];

export default function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[var(--mo-z-nav)] flex justify-center bg-[var(--mo-color-bg-primary)] border-t-[0.5px] border-t-[var(--mo-color-border-subtle)] pb-[var(--mo-safe-bottom)] backdrop-blur-[var(--mo-blur-md)]">
            <div className="w-full max-width-[var(--mo-screen-max-width)] h-[var(--mo-bottom-nav-height)] flex items-center justify-around px-2">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center gap-1.5 px-3 h-full min-w-[64px] transition-all
                            ${isActive ? 'text-[var(--mo-color-accent-system)]' : 'text-[var(--mo-color-text-secondary)]'}
                        `}
                    >
                        <Icon
                            name={item.icon}
                            size={22}
                        />
                        <span className="text-[10px] font-medium tracking-tight">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
