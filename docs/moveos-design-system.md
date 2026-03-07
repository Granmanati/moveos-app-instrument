# MOVE OS Product Design Master Specification
Version: 1.1
Status: Active Design Reference
Purpose: Canonical product design definition for MOVE OS
Owner: MOVE OS Product Team

---

# 1. PRODUCT DEFINITION

MOVE OS is a Movement Operating System.

It is not:
- a fitness app
- a wellness app
- a workout library
- a lifestyle coaching product

MOVE OS is:
- an adaptive movement system
- a behavioral return engine
- a system that structures human movement execution
- a premium technology product

The interface must feel like:
- a system
- a tool
- a control surface
- a serious technology product

Comparable product references:
- Linear
- Stripe Dashboard
- Apple system apps
- Tesla UI
- Oura
- Whoop

The interface must never resemble:
- influencer fitness apps
- wellness-first products
- playful consumer fitness dashboards
- motivational content platforms

---

# 2. DESIGN OBJECTIVE

The MOVE OS interface must achieve a perceived product quality of:

9.8 / 10

This quality level is measured by:
- hierarchy clarity
- visual restraint
- interface precision
- brand consistency
- motion coherence
- product credibility
- system identity
- responsive balance
- elimination of visual noise

The interface must feel:
- premium
- engineered
- calm
- intelligent
- scalable

---

# 3. CORE DESIGN PRINCIPLES

## 3.1 System before decoration

Every visual element must communicate:
- system structure
- system state
- actionable meaning
- product intelligence

No decorative visual layers should exist without purpose.

## 3.2 Quiet power

The UI must feel calm and controlled.

Avoid:
- excessive glow
- neon overload
- large decorative gradients
- oversized shadows
- noisy surfaces
- over-animated elements

## 3.3 Precision

Spacing, typography, layout and hierarchy must feel engineered.

The interface should communicate:
- control
- discipline
- clarity
- technical product maturity

## 3.4 Identity over intensity

MOVE OS builds behavioral identity through continuity and return.

Design must reinforce:
- consistency
- repetition
- progress
- system trust

## 3.5 Product over concept

MOVE OS may begin as a conceptual category, but the interface must feel like a real product.

The UI must not feel speculative or unfinished.

---

# 4. BRAND SYMBOL SYSTEM

The MOVE OS symbol is based on:

node + line + system structure

The symbol represents:
- adaptive pathways
- system architecture
- movement intelligence
- structured flow

The symbol must be treated as a software mark.

Approved usage:
- app icon
- global header lockup
- selected system moments
- institutional surfaces
- selected dashboards
- product marketing assets

Avoid:
- repeated watermarking
- decorative large-scale use
- background tiling
- random symbolic repetition

The symbol must increase perceived product authority, never clutter.

---

# 5. BRAND LOCKUP / HEADER SYSTEM

The app header must function as a product lockup, not a generic screen title.

Required structure:

[ MOVE OS symbol ] MOVE OS
SYSTEM ACTIVE

Alternative sublabel options when appropriate:
- ADAPTIVE MOVEMENT SYSTEM
- SYSTEM ACTIVE
- MOVEMENT OPERATING SYSTEM

Header rules:
- the symbol must appear with clear authority
- the wordmark must have stronger hierarchy than the current simple title treatment
- use a subtle structural divider below the header when helpful
- maintain minimalism and premium software feel
- no decorative effects around the logo
- no oversized header blocks
- no weak generic title styling

The header must feel like:
- a real software product header
- a funded startup interface
- a premium operating system layer

---

# 6. COLOR SYSTEM

## 6.1 Core palette

Background Primary
#0B0F14

Surface Primary
#141A22

Surface Secondary
#10161D

Border Subtle
#1C2430

System Accent
#2D7CFF

Text Primary
#F4F7FB

Text Secondary
#8A93A3

Text Tertiary
#667085

## 6.2 Functional Health State Colors

MOVE OS includes a Health State System.

Aligned / Success
#18B67A

Compensating / Warning
#E8A23A

Overload / Alert
#E45462

Rules:
- state colors appear only when meaningful
- state colors must not dominate the interface
- state colors must not be used decoratively
- blue remains the core brand/system accent
- green, amber and red belong primarily to product state feedback

## 6.3 Usage rules

Blue is the main product accent and should be used for:
- active states
- active navigation
- buttons
- progress accents
- system lines
- node indicators

State colors are used for:
- health status
- load state
- alerts
- compensations
- mission suitability

Avoid:
- too many active colors in the same screen
- excessive blue glow
- gradients as primary styling language

---

# 7. TYPOGRAPHY

## 7.1 Primary Typeface

Inter

Used for:
- screen titles
- card titles
- body text
- navigation labels
- CTA labels
- main UI hierarchy

## 7.2 System Typeface

IBM Plex Mono

Used for:
- system labels
- metrics
- technical indicators
- micro labels
- metadata
- version labels
- telemetry

Examples:
- RETURN RATE
- SESSION LOAD
- SYSTEM ACTIVE
- MOVE OS v1.0

## 7.3 Typography hierarchy

Use no more than three hierarchy levels inside a card.

Recommended scale:
- Screen Title / Major Value: strong and clear
- Card Label / Card Title: medium hierarchy
- Support Text / Metadata: subtle and secondary

Typography should feel:
- restrained
- technical
- readable
- precise

Avoid:
- oversized display typography
- decorative type treatments
- inconsistent label sizing

---

# 8. SPACING SYSTEM

Base grid:
8px

Approved spacing tokens:
- 8
- 16
- 24
- 32
- 48
- 64

Rules:
- all layouts must follow an 8px rhythm
- avoid arbitrary margins
- use whitespace intentionally
- remove visual dead zones
- screens must feel compact but breathable

The app currently suffers from:
- artificial vertical scroll space
- empty viewport zones
- weak top anchoring of content

This must be corrected.

Layout rules:
- content should start near the top of the usable viewport
- scroll must occur only when content exceeds viewport height
- avoid wrappers that create empty vertical space
- avoid sub-screens using h-screen or min-height patterns incorrectly
- vertical rhythm must feel deliberate

---

# 9. ICON SYSTEM

MOVE OS uses a dedicated icon system.

## 9.1 Style rules

Grid:
24 × 24

Stroke:
1.5px

Style:
line-based only

Corners:
subtle, controlled, not overly rounded

Color rules:
- inactive: #8A93A3
- active: #2D7CFF
- state-driven colors only when functionally meaningful

Avoid:
- filled icons
- playful icons
- generic Material icon feel
- mixed icon sets

Icons must feel closer to:
- SF Symbols
- Linear icons

## 9.2 Categories

### Navigation
- Home
- Mission
- Progress
- System

### System State
- Aligned
- Compensating
- Overload

### Metrics
- Return Rate
- Session Load
- Pain
- Recovery
- Strain

### Execution
- Exercise
- Timer
- Next Block
- Completed Block

---

# 10. STRUCTURAL INTERFACE LAYER

MOVE OS includes a subtle structural interface layer.

Purpose:
- communicate system intelligence
- reinforce product identity
- create a sense of engineered architecture

Approved elements:
- thin connection lines
- node markers
- partial modular frames
- micro system labels
- subtle technical dividers
- subtle micro-grid when appropriate

Example labels:
- SYS_ACTIVE
- MODE_LAYER
- RETURN_METRIC
- SESSION_PIPELINE

Rules:
- must remain subtle
- never dominate the screen
- must never feel like sci-fi HUD clutter
- must reinforce product structure, not distract

The desired effect is:
2035 minimal, elegant, technical

Not:
cyberpunk
gaming UI
medical monitor overload

---

# 11. CARD SYSTEM

MOVE OS uses a three-level card system.

## 11.1 PrimaryCard

Used for:
- Active Mission
- Mission-critical actions

Characteristics:
- largest visual emphasis
- contains the main CTA
- stronger hierarchy
- slightly stronger border treatment if needed
- must feel actionable

## 11.2 SystemCard

Used for:
- System Status
- Adaptive Mode
- Major system summaries

Characteristics:
- medium emphasis
- communicates state and meaning
- can contain node/line accents
- supports health state colors subtly

## 11.3 MetricCard

Used for:
- Return Rate
- Session Load
- Pain Trend
- Session Volume
- System Strain

Characteristics:
- compact
- numerical focus
- analytical feel
- supports simple micro bars or gauges

Rules:
- not all cards should feel equal
- card hierarchy must communicate importance immediately
- current UI issue: cards are too visually homogeneous
- this must be corrected

---

# 12. DASHBOARD ARCHITECTURE

The Home screen is the core control surface of MOVE OS.

It must answer these four questions immediately:
1. What is my system state today?
2. What should I do now?
3. Am I returning consistently?
4. Which mode is active?

## 12.1 Required hierarchy

1. System Status
2. Active Mission
3. Return Rate
4. System Metrics
5. Recent Activity

The current issue is weak hierarchy.
All blocks currently compete too much.
This must be corrected.

## 12.2 Dashboard structure

Header

System Status Card

Active Mission Card

System Metrics Row

Recent Activity Block

Bottom Navigation

## 12.3 System Status

Displays:
- Aligned / Compensating / Overload
- short explanation
- subtle node indicator
- subtle state line or accent

This must be the first major visual anchor.

## 12.4 Active Mission

Displays:
- mission title
- duration
- mission type
- primary action button

Example:
- Regulate Protocol
- 10 min
- START SESSION

This must be the dominant action card.

## 12.5 System Metrics

Recommended:
- Return Rate
- Session Load
- System Strain

These should not overpower the mission.

## 12.6 Recent Activity

Displays:
- last completed sessions
- skipped sessions
- last system actions

This adds credibility and continuity.

---

# 13. BOTTOM NAVIGATION

MOVE OS bottom navigation must have four tabs only:

- Home
- Mission
- Progress
- System

This replaces the previous five-tab structure.

Reason:
- remove redundancy between Home and Today
- reduce cognitive load
- strengthen product architecture

Navigation rules:
- minimal
- line icons
- active item in blue
- no excessive glow
- clear enough to scan instantly

---

# 14. MISSION SCREEN

The Mission screen must behave like a structured execution pipeline, not a content feed.

Current problem:
- it feels too much like a feed of content blocks
- it needs stronger operational logic

Required structure:
- Session Progress
- Current Block
- Next Block
- Remaining Blocks
- Completion State

The pipeline must communicate:
- sequence
- execution flow
- progress
- system continuity

The Mission screen should feel like:
- a guided execution engine
- a structured system path

Not:
- a feed
- a content playlist
- a social fitness session

---

# 15. PROGRESS SCREEN

The Progress screen must feel analytical and system-driven.

Required areas:
- Return Consistency
- Pain Trend
- Session Volume
- Load Balance

Charts must feel:
- restrained
- analytical
- minimal
- product-grade

Avoid:
- decorative chart clutter
- bright colors everywhere
- generic dashboard look

---

# 16. EXPLORE SCREEN

The Explore screen must be simplified and structured.

Current issue:
- too many chips / filters
- visual density too high

Required structure:
- Search
- Movement Patterns
- Equipment
- Level

Recommended taxonomy:

Movement Patterns
- Squat
- Hinge
- Push
- Pull

Equipment
- Bodyweight
- Bands
- Kettlebell

Level
- L1
- L2
- L3

The screen must feel organized, not filter-heavy.

---

# 17. SYSTEM SCREEN

The System screen replaces the traditional profile screen.

It should include:
- User
- Subscription
- Settings
- Clinical History
- Language
- Privacy
- App Version / MOVE OS Version

Rules:
- less empty space at the top
- more institutional and product-like
- less consumer-social feeling

---

# 18. HEALTH STATE SYSTEM

MOVE OS includes a Health State System.

States:
- Aligned
- Compensating
- Overload

These states must:
- influence mission recommendation
- appear in status badges
- remain visually subtle
- be understandable in under 1 second

### Aligned
Meaning:
- system capacity stable
- user can load or progress

### Compensating
Meaning:
- mild instability or load compensation
- system should regulate or reduce load

### Overload
Meaning:
- high strain / risk
- system should prioritize recovery or protection

Health states must feel like:
- product intelligence
- system feedback

Not:
- alarmist medical warnings
- decorative badge colors

---

# 19. MOTION SYSTEM

MOVE OS includes a product motion system.

Motion must communicate:
- system behavior
- feedback
- progression
- precision

It must never feel playful.

## 19.1 Approved animation types

### System Node Pulse
Used when:
- system status updates
- mission completes
- active state changes

Duration:
600ms

### Progress Fill
Used for:
- metrics
- bars
- mission completion
- return rate

Duration:
800ms

### Pipeline Advance
Used for:
- mission block completion
- session sequence progression

Behavior:
- node activates
- line illuminates
- next block advances

Duration:
500ms

### Screen Transition
Behavior:
- fade + slide

Duration:
220ms

### Button Press
Behavior:
- scale to 0.96
- subtle press feedback

Duration:
120ms

## 19.2 Animation curves

Primary:
ease-out

System:
cubic-bezier(0.4,0,0.2,1)

## 19.3 Motion rules

Avoid:
- bounce
- springy playful motion
- overly elastic interactions
- long theatrical transitions

Motion should feel:
- subtle
- engineered
- premium
- technical

---

# 20. LAYOUT AND RESPONSIVE RULES

The app must:
- fill the viewport naturally
- avoid artificial scroll space
- respect safe areas
- maintain top anchoring of content
- remain visually balanced on mobile-first layouts

Known issue to correct:
Several screens currently create empty vertical scrolling and weak content centering.

Fix requirements:
- remove unnecessary min-height wrappers
- remove dead vertical zones
- optimize top/bottom padding
- ensure the content block feels intentionally placed

No screen should require scroll if the real content fits the viewport.

---

# 21. BRAND AND VISUAL AUTHORITY ISSUES TO CORRECT

Current known issues:
- MOVE OS wordmark feels too weak
- header lacks brand authority
- symbol is underutilized
- cards are too visually equal
- some screens feel more like product drafts than a mature system

Required corrections:
- stronger header lockup
- clearer hierarchy
- improved card importance
- reduced navigation redundancy
- more premium product-level coherence

---

# 22. DESIGN QUALITY TARGET

MOVE OS must achieve the following perception:

| Dimension | Target |
|---|---|
Brand identity | Strong |
Hierarchy | Excellent |
Clarity | Excellent |
Layout discipline | Excellent |
System feel | Very High |
Motion quality | High |
Icon consistency | High |
Product credibility | Very High |

Target product quality:
9.8 / 10

If any UI change lowers perceived product authority, it must be rejected or refactored.

---

# 23. IMPLEMENTATION PHILOSOPHY

All design implementation must follow this order:

1. design tokens
2. component system
3. header / lockup
4. dashboard hierarchy
5. navigation structure
6. mission pipeline
7. analytics layer
8. icon system
9. motion system
10. final audit

The product must be refactored progressively, not through random disconnected visual edits.

---

# 24. PURPOSE OF THIS DOCUMENT

This document is the canonical reference for MOVE OS product design.

It must be used for:
- Antigravity implementation
- AI-assisted design conversations
- frontend engineering work
- design audits
- future improvements

This document must preserve the current design direction already defined.
It must not be replaced by a new style direction unless explicitly approved.

Every future improvement must remain aligned with this specification.

---
# END OF DOCUMENT