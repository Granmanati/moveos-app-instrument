export const tokens = {
    colors: {
        background: {
            primary: 'var(--background)',
        },
        surface: {
            primary: 'var(--card)',
            secondary: 'var(--surface-muted)',
        },
        border: {
            subtle: 'var(--border)',
        },
        text: {
            primary: 'var(--foreground)',
            secondary: 'var(--mo-color-text-secondary)',
            tertiary: 'var(--mo-color-text-tertiary)',
        },
        brand: {
            accent: 'var(--primary)',
        },
        state: {
            aligned: 'var(--success)',     // Success
            compensating: 'var(--warning)', // Warning
            overload: 'var(--destructive)',    // Alert
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
        thin: '1px solid var(--border)',
        active: '1px solid var(--primary)',
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
