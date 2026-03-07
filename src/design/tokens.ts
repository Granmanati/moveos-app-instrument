export const tokens = {
    colors: {
        background: {
            primary: '#0B0F14',
        },
        surface: {
            primary: '#141A22',
            secondary: '#10161D',
        },
        border: {
            subtle: '#1C2430',
        },
        text: {
            primary: '#F4F7FB',
            secondary: '#8A93A3',
            tertiary: '#667085',
        },
        brand: {
            accent: '#2D7CFF',
        },
        state: {
            aligned: '#18B67A',     // Success
            compensating: '#E8A23A', // Warning
            overload: '#E45462',    // Alert
        }
    },
    typography: {
        family: {
            primary: '"Inter", system-ui, -apple-system, sans-serif',
            system: '"IBM Plex Mono", monospace',
        },
        weights: {
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        }
    },
    spacing: {
        grid: 8,
        sp1: '8px',
        sp2: '16px',
        sp3: '24px',
        sp4: '32px',
        sp5: '48px',
        sp6: '64px',
    },
    radius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        pill: '100px',
    },
    borders: {
        thin: '1px solid var(--border-subtle)',
        active: '1px solid var(--accent)',
    },
    icons: {
        strokeWidth: 1.5,
        size: 24,
    },
    motion: {
        durations: {
            buttonPress: '120ms',
            screenTransition: '220ms',
            pipelineAdvance: '500ms',
            nodePulse: '600ms',
            progressFill: '800ms',
        },
        curves: {
            primary: 'ease-out',
            system: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }
    }
} as const;

export type DesignTokens = typeof tokens;
