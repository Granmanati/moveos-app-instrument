# Design System: MOVE OS High-Fidelity Premium

## 1. Visual Theme & Atmosphere
The MOVE OS aesthetic is **Clinical-Tech Premium**. It is calm, precise, and highly organized. It avoids decorative clutter in favor of functional elegance. The interface feels like a high-end medical operating system—trustworthy, low-cognitive-load, and futuristic yet grounded.

- **Density**: Airy with significant breathing room (whitespace).
- **Mood**: Precise, supportive, and sophisticated.
- **Aesthetic Philosophy**: "Movement through precision."

## 2. Color Palette & Roles
- **Primary Background (#0B0F14)**: Deep technical obsidian. Used for the main application shell and fundamental layers.
- **Surface Primary (#141A22)**: Dark slate gray. Used for primary cards and elevation.
- **Accent System (#2D7CFF)**: Precise electric blue. Used for primary actions, active states, and success indicators.
- **Text Primary (#F4F7FB)**: Off-white crystal. Used for main titles and high-priority labels.
- **Text Secondary (#8A93A3)**: Muted steel. Used for body text and secondary information.
- **Text Tertiary (#667085)**: Deep charcoal. Used for non-essential metadata and inactive states.

## 3. Typography Rules
- **Font Stack**: Inter (Sans-Serif) for all human-readable text. IBM Plex Mono (Monospaced) for technical system signals.
- **Hierarchy**:
  1. **Main Titles**: Inter SemiBold (20px-28px), left-aligned, significant top margin.
  2. **Section Titles**: Inter Medium (14px-16px), left-aligned, clear separation from cards.
  3. **Body/Buttons**: Inter Regular (14px).
  4. **Technical Labels**: IBM Plex Mono (10px), all-caps reaching for 0.08em tracking.
- **Rule**: Never mix Inter and Mono on the same line without explicit structural spacing.

## 4. Component Stylings
- **Cards**: 
  - **Rounded Corners**: 20px radius for a friendly yet technical feel.
  - **Padding**: Uniform 20px internal padding.
  - **Border**: 0.5px hairline border (#1C2430) for definition.
- **Buttons**:
  - **Height**: 52px for premium touch targets.
  - **Radius**: 16px (slightly less than cards for better nested geometry).
- **Bottom Navigation**:
  - **Structure**: Icon above label.
  - **Color**: Active (Accent System), Inactive (Text Secondary).

## 5. Layout Principles
- **Grid**: Strict 20px horizontal margins for the entire screen.
- **Vertical Rhythm**: 16px gap between distinct sections.
- **Alignment**: 100% left-aligned unless inside a symmetrical metric grid.
- **Efficiency**: Maximum 3 main content blocks visible above the fold to minimize cognitive load.
