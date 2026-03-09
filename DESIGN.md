# Design System: MOVE OS Premium UI
**Project ID:** 8934571635460528641

## 1. Visual Theme & Atmosphere
The MOVE OS aesthetic is "Clinical-Tech High-Performance." It avoids generic fitness industry tropes (vibrant lime greens, soft pastels, or motivational photography) in favor of a precise, biological-software interface.
- **Mood**: Calm, precise, trustworthy, and logic-driven.
- **Visual Weight**: Lightweight, utilizing 0.5px "hairline" borders and spacious layouts to reduce cognitive load for users potentially in pain or anxiety.
- **Structural Identity**: Employs a "micro-grid" with incomplete modular frames (broken corners) and small circular "nodes" at line intersections, simulating a technical or orthopedic plotting system.

## 2. Color Palette & Roles

### Dark Mode (Primary)
- **Technical Void (#0B0F14)**: Primary background. Deep, high-contrast, providing a stable foundation.
- **Accent Blue (#2D7CFF)**: System action color. Used for primary CTAs, active nodes, and progress fills.
- **Clinical White (#F4F7FB)**: Primary text and high-importance data.
- **Ghost Grey (#8A93A3)**: Secondary metadata, labels, and inactive structural lines.
- **Surface Deep (#141A22)**: Card backgrounds and modular surfaces.

### Light Mode (High-Glare)
- **Sterile Frost (#F7FAFD)**: Primary background for daylight or high-glare environments.
- **Ink Navy (#0F1722)**: Primary text and iconography.
- **Soft Slate (#EDF2F7)**: Modular card surfaces.
- **Accent Blue (#2D7CFF)**: Consistent system action color across both themes.

## 3. Typography Rules
- **Inter (Sans)**: Used for all primary UI interactions, headings, and readability-critical text.
- **IBM Plex Mono (Monospace)**: Used exclusively for technical metadata, numeric values (sets, reps, scores), and "System Observations." This reinforces the hardware/OS identity.
- **Weight Strategy**: Prefers Light (300) and Regular (400) for headers to maintain the "calm" atmosphere. Semibold (600) reserved only for primary CTAs.

## 4. Component Stylings
- **Buttons**: Pill-shaped or modular with 12px radius. Primary buttons use #2D7CFF with no gradient. Secondary buttons use ghost-borders (0.5px).
- **Cards/Containers**: Incomplete modular frames. Borders are 0.5px. Radius is 16px, but often "broken" at corners to reveal the underlying micro-grid.
- **Progress Visualization**: Circular nodes connected by thin lines. No heavy charts; prefers sparklines and node-and-line "pipelines."
- **Badges**: Small, monochrome, with wide tracking (0.08em) using IBM Plex Mono.

## 5. Layout Principles
- **8px Micro-Grid**: All spacing and alignment must snap to an 8px base.
- **Whitespace**: "Breathable" margins (20px minimum) to ensure low cognitive load.
- **Touch Targets**: Minimum 44x44px for consistency with physiotherapy accessibility.
- **Pipeline Flow**: Vertical data hierarchy with node connectors to guide the eye through the movement session logic.
