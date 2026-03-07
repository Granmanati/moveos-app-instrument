# MOVE OS UI Audit Report
Date: 2026-03-07
Target: MOVE OS Product Quality 9.8/10
Reference: /docs/moveos-design-system.md (v1.1)

---

## 1. Layout & Spacing Problems
- **Artificial Scroll**: `min-height: 100vh` in `index.css` (#root, .app-wrapper, .app-container) causes mandatory scrolling even when content fits the viewport.
- **Top Anchoring**: Content starts too low on several screens. Layout rules require content to start near the top of the usable viewport.
- **Vertical Rhythm**: Spacing between cards often uses arbitrary values or generic `--sp-4` without strict 8px rhythm (found inconsistencies in `HomePage.module.css` and `TodayPage.module.css`).

## 2. Incorrect Color Usage
- **Missing Secondary Surface**: `index.css` only defines `--surface-subtle (#141A22)`. The master spec requires `Surface Secondary (#10161D)` for nested or support surfaces.
- **Missing Text Tertiary**: `Text Tertiary (#667085)` is not defined in tokens, leading to over-reliance on `--text-secondary`.
- **Gradients & Glow**: Some legacy components still use subtle gradients or glow effects that violate the "Quiet Power" principle (No decorative layers).

## 3. Typography Matches
- **Font Misalignment**: 
  - Screen titles on `HomePage` are currently using `IBM Plex Mono` via inline styles; spec requires `Inter` for screen titles.
  - Metrics in `TodayPage` (Mission screen) are missing `IBM Plex Mono` for numerical values.
- **Hierarchy Depth**: Some cards contain more than 3 levels of typographical hierarchy, creating visual noise.

## 4. Incorrect Card Hierarchy
- **Homogeneity**: All cards look visually equivalent. 
- **Missing Variants**: 
  - **PrimaryCard**: Not implemented. The "Active Mission" should have the largest visual emphasis.
  - **MetricCard**: Compact analytical cards are missing; currently using full `SystemCard` for metrics.
- **Weight**: No visual distinction in border or background intensity between different importance levels.

## 5. Navigation Issues
- **Tab Overload**: Currently using 5 tabs (Home, Today, Explore, Progress, Profile). Master spec mandates 4 tabs: **Home, Mission, Progress, System**.
- **Redundancy**: Significant overlap between Home and Today.
- **Labeling**: "Today" and "Explore" must be renamed to follow the consolidated structure.

## 6. Icon System Audit
- **Stroke Weight**: Icons are using `strokeWidth={2}`. The spec requires `1.5px` for a technical, precise feel.
- **Consistency**: Mixing `Lucide` defaults with custom interpretations. Need to shift towards the "SF Symbols/Linear" aesthetic.

## 7. Motion System Audit
- **Animation Curve**: Transitions are using default cubic-beziers. Missing the specific `ease-out` and `cubic-bezier(0.4, 0, 0.2, 1)` product curves.
- **Missing Specific Animations**: 
  - No **System Node Pulse** for status changes.
  - No **Pipeline Advance** illumination for session progress.
  - Screen transitions are simplistic (fade + slide only) and often feel "floaty" rather than "engineered".

## 8. Brand Lockup (Header)
- **Wordmark Weight**: The header lockup "[ symbol ] MOVE OS" + "SYSTEM ACTIVE" is currently missing or poorly implemented.
- **Institutional Authority**: The top of the screens feels like a "generic app" rather than a "funded startup/premium OS".

---
### Next Steps Recommendation (Phase 30 Execution):
1. Update `index.css` with missing tokens.
2. Refactor `AppShell` to enforce the new Header Lockup.
3. Repurpose `BottomNav` to a 4-tab system.
4. Create `PrimaryCard` and `MetricCard` primitives.
5. Audit and refactor `Mission` (Today) and `System` (Profile) screens for pipeline-first logic.
