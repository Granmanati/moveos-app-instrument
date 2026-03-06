# MOVE OS UI Refactor Plan
Version 1.0

Objective:

Transform the current interface into a consistent MOVE OS system.

Refactoring will occur in controlled phases.

---

# Phase 1 — Design Token System

Goal:

Centralize all visual constants.

Tasks:

• define color tokens: Map new HEX codes and remove `rgba()` opacity hacks.
  - Background Primary: `#0B0F14` (Current `--bg-default` is `#070A12`)
  - Text Primary: `#F4F7FB` (Current `--text-primary` is `rgba(255, 255, 255, 0.92)`)
  - Text Secondary: `#8A93A3` (Current `--text-secondary` is `rgba(255, 255, 255, 0.65)`)
  - Surface Subtle: `#141A22` (Current uses `--surface-1/2/3`)
  - Border Subtle: `#1C2430` (Current uses `--border-1/2`)
• define typography tokens: Import `IBM Plex Mono` to `index.css` (currently missing).
• define spacing tokens: Ensure strict adherence to 8px grid.
• define border and radius tokens: Set default card radius to 12-16px.
• **Purge Rule Violators**: Delete `--glow-accent`, `--glow-border`, `linear-gradient` in buttons, and `radial-gradient` in `body` from `index.css` immediately. Delete `--ease-bounce` (`iconBounce`).

All hardcoded styling must be removed.

Example tokens:

COLOR_BACKGROUND_PRIMARY
COLOR_SYSTEM_ACCENT
COLOR_STATE_SUCCESS
COLOR_STATE_WARNING
COLOR_STATE_ALERT

---

# Phase 2 — UI Primitives

Goal:

Standardize foundational components.

Components to refactor in `src/components/ui/`:

`PrimaryButton` & `SecondaryButton`: Remove linear gradients and drop shadows. Make them flat with 1px border.  
`Card` (Missing primitive): Extract `metricCard`, `upgradeCard`, `sessionCard` from `HomePage.css` and `ProfilePage.css` into a unified `<Card>` primitive using `#141A22` and `1px solid #1C2430`.  
`Input`  
`StatusBadge`: Refactor to use only `#18B67A` (Success), `#E8A23A` (Warning), `#E45462` (Alert). Remove arbitrary colors.  
`VideoHUDPreview`: Remove scrim linear gradients.

Requirements:

• use tokens only  
• remove custom styling variations  
• enforce consistent spacing

---

# Phase 3 — Dashboard Refactor

Target: `src/pages/HomePage.tsx`

Goal:

Redesign the main system screen. Remove the "motivational" greeting (e.g. `Hola, Atleta`) and replace it with strict system state labels.

Elements required:

System Status (Currently mapped as "Phase of Inicial", needs generic technical state mapping)  
Return Rate (Currently "Sessions", needs mapping to technical return rate)  
Active Mission (Currently "Generate Today's Session", needs a structural mission block)  
Daily Progress (7-day timeline needs technical refresh)  

The dashboard must clearly communicate:

system state first.

---

# Phase 4 — Mode Screens

Refactor each Mode to follow system rules.

Modes:

LevelMove Mode  
Recovery Mode  
Performance Mode  

Each mode must:

• reuse global components
• maintain system consistency
• only adjust emphasis

---

# Phase 5 — Structural Interface Layer

Introduce subtle system architecture visuals.

Examples:

• thin connection lines
• node markers
• partial frame segments

Must remain subtle.

---

# Phase 6 — Motion Layer

Introduce motion elements:

• node activation
• progress movement
• subtle system transitions

No playful animations allowed.  
**Critical Action**: Remove `iconBounce` and `--ease-bounce` from `BottomNav.module.css` and `index.css`. Replace with linear fast fades.

---

# Phase 7 — Landing Page Alignment

Marketing pages must follow the same design system.

Avoid:

marketing visual language that differs from product UI.

---

# Expected Outcome

After refactor:

MOVE OS should visually communicate:

• a real operating system
• adaptive intelligence
• premium technology product

---

# End of Document