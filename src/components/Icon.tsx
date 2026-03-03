import React from 'react';
import {
    PlayCircle, VolumeX, Volume2, User, Info, RefreshCw, CheckCircle,
    Activity, HeartPulse, Check, CalendarX, Zap, Award, UserCog,
    Bell, ShieldPlus, Shield, ChevronRight, LogOut, ArrowLeft,
    CalendarCheck, TrendingUp, LineChart, Compass, Search, X,
    AlertCircle, Library, LayoutDashboard, ListTodo
} from 'lucide-react';

/**
 * MOVE OS V1 Icon wrapper for Lucide React
 * Hybrid Clinical + Technological aesthetic.
 */

// Mapping Material Symbol names to Lucide icons
const iconMap: Record<string, React.ElementType> = {
    'play_circle': PlayCircle,
    'volume_off': VolumeX,
    'volume_up': Volume2,
    'person': User,
    'info': Info,
    'autorenew': RefreshCw,
    'check_circle': CheckCircle,
    'data_usage': Activity,
    'healing': HeartPulse,
    'check': Check,
    'event_busy': CalendarX,
    'bolt': Zap,
    'workspace_premium': Award,
    'manage_accounts': UserCog,
    'notifications': Bell,
    'local_hospital': ShieldPlus,
    'shield': Shield,
    'chevron_right': ChevronRight,
    'logout': LogOut,
    'arrow_back': ArrowLeft,
    'event_available': CalendarCheck,
    'trending_up': TrendingUp,
    'monitoring': LineChart,
    'explore': Compass,
    'search': Search,
    'close': X,
    'error': AlertCircle,
    'video_library': Library,
    'search_off': Search, // No direct equivalent, fallback
    'space_dashboard': LayoutDashboard,
    'checklist': ListTodo,
    'lock': Shield,
};

interface IconProps {
    name: string;
    size?: number;
    active?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

export const Icon: React.FC<IconProps> = ({
    name,
    size = 24,
    active = false,
    style,
    className = ''
}) => {
    // Active uses accent blue, inactive uses muted color.
    // Explicit override via style prop takes precedence if provided.
    const color = active ? 'var(--accent)' : 'var(--text-muted)';

    // Fallback to Info if name is not found in map
    const LucideIcon = iconMap[name] || Info;

    return (
        <LucideIcon
            size={size}
            color={color}
            className={className}
            style={{
                ...style
            }}
            strokeWidth={2}
            aria-hidden="true"
        />
    );
};
