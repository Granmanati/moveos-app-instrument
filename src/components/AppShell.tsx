import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { SystemHeader } from './ui/SystemHeader';

interface AppShellProps {
    title: string;
    sublabel: string;
    hideNav?: boolean;
    children: ReactNode;
}

export default function AppShell({ title, sublabel, hideNav = false, children }: AppShellProps) {
    const location = useLocation();

    return (
        <div className="flex flex-col flex-1 h-full relative overflow-hidden bg-[var(--mo-color-bg-primary)]">
            <SystemHeader title={title} sublabel={sublabel} />

            <main className={`flex-1 overflow-y-auto overflow-x-hidden w-full flex flex-col items-center ${hideNav ? '' : 'pb-[var(--mo-bottom-nav-height)]'}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        className="w-full flex flex-col min-h-min"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {!hideNav && <BottomNav />}
        </div>
    );
}
