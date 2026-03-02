import React from 'react';

/**
 * MOVE OS V1 Icon wrapper for Material Symbols Outlined
 * Hybrid Clinical + Technological aesthetic.
 */

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

    return (
        <span
            className={`material-symbols-rounded ${className}`}
            style={{
                fontSize: `${size}px`,
                color,
                // Ensure icons don't randomly display words while loading
                fontFeatureSettings: '"liga"',
                ...style
            }}
            aria-hidden="true"
        >
            {name}
        </span>
    );
};
