# MOVE OS — Component Map
Version: 1.0
Status: Canonical Component Architecture Reference
Purpose: Define the component system, ownership, reuse rules, and deprecation map for MOVE OS

---

# 1. Component Philosophy

MOVE OS must be built from a **small, disciplined set of reusable product components**.

The product must not grow through random page-specific UI fragments.

All screens must reuse shared product primitives.

The component system must feel:

- modular
- predictable
- scalable
- premium
- technically coherent

Avoid:
- duplicated UI blocks
- screen-specific ad hoc headers
- multiple card styles for the same purpose
- repeated loading implementations
- route-specific navigation variants

---

# 2. Target Component Architecture

Recommended high-level structure:

src/

components/
  branding/
  navigation/
  system/
  cards/
  metrics/
  mission/
  feed/
  charts/
  settings/
  feedback/
  skeletons/

layout/
  AppShell/

pages/
  HomePage
  MissionPage
  ExplorePage
  ProgressPage
  SystemPage

---

# 3. Root Layout Components

These components define product structure and must be shared globally.

## 3.1 AppShell

Role:
Global screen shell.

Responsibilities:
- render shared page chrome
- render SystemHeader
- apply screen padding
- manage content viewport
- include BottomNav
- preserve mobile layout consistency

Rules:
- every top-level screen must be rendered inside AppShell
- pages must not recreate their own shell
- pages must not bypass AppShell spacing rules

Status:
REQUIRED

---

## 3.2 SystemHeader

Role:
Institutional product header.

Responsibilities:
- display MOVE OS symbol + wordmark lockup
- show screen title
- show screen sublabel
- preserve product brand authority

Structure:
[ symbol ] MOVE OS
SCREEN TITLE
SUBLABEL

Rules:
- must be used by Home, Mission, Explore, Progress, System
- no page may create a custom alternative header
- all screen titles/subtitles must pass through this component

Status:
REQUIRED

---

## 3.3 BottomNav

Role:
Primary navigation.

Final navigation items:
- Home
- Mission
- Explore
- Progress
- System

Rules:
- exactly five tabs
- same icon style everywhere
- active state uses system blue
- no legacy navigation structure
- no hidden old tabs

Status:
REQUIRED

---

# 4. Brand Components

## 4.1 BrandLockup

Role:
Standalone rendering of symbol + MOVE OS wordmark.

Use cases:
- splash screen
- auth/wait states
- onboarding
- empty states
- premium upsell surfaces

Rules:
- should reuse the same visual proportions as SystemHeader
- no alternate logo compositions

Status:
REQUIRED

---

## 4.2 MoveOSSymbol

Role:
Pure symbol rendering component.

Use cases:
- app icon contexts
- header lockup
- animated node-line interactions
- premium markers

Rules:
- do not decorate it
- do not stretch or distort it
- treat as a software mark

Status:
REQUIRED

---

# 5. Core Card Components

MOVE OS uses a strict three-tier card system.

## 5.1 PrimaryCard

Role:
Highest-priority product action card.

Used for:
- Active Mission
- Subscription block
- Premium unlock CTA
- Mission completion state

Rules:
- most visually dominant card on a screen
- strongest internal hierarchy
- primary CTA allowed
- not overused

Status:
REQUIRED

---

## 5.2 SystemCard

Role:
State / summary card.

Used for:
- System Status
- Adaptive Mode
- Session Context
- High-level state summaries

Rules:
- medium prominence
- can contain subtle node-line structural accents
- can use state colors functionally

Status:
REQUIRED

---

## 5.3 MetricCard

Role:
Compact analytical card.

Used for:
- Return Rate
- Session Load
- Avg Pain
- Session Volume
- Adherence
- Load Balance

Rules:
- numerical focus
- compact structure
- mono labels where appropriate
- secondary to PrimaryCard and SystemCard

Status:
REQUIRED

---

# 6. System State Components

## 6.1 SystemStatusCard

Role:
Render the top-level user system state.

States:
- Aligned
- Tension / Compensating
- Risk / Overload

Structure:
- label
- state title
- support text
- optional node accent

Rules:
- must be the first major anchor on Home
- state color usage must remain subtle
- must not feel like an alarm panel

Status:
REQUIRED

---

## 6.2 HealthStateBadge

Role:
Small badge for state representation.

States:
- Aligned
- Tension
- Risk

Rules:
- can appear inside SystemStatusCard, Mission blocks, Progress insights
- small only
- never use giant pill badges

Status:
REQUIRED

---

## 6.3 AdaptiveModeIndicator

Role:
Show which system mode is active.

Examples:
- RETURN
- REGULATE
- LOAD
- ADAPT
- BECOME

Rules:
- small technical indicator
- not a decorative hero element

Status:
REQUIRED

---

# 7. Home Components

## 7.1 HomeSystemIdentity

Role:
Render node identity and phase context.

Content:
- node/user name
- adaptive phase
- system path line

Rules:
- must not overpower System Status
- must feel technical, not profile-like

Status:
RECOMMENDED

---

## 7.2 ActiveMissionCard

Role:
Render current recommended mission.

Content:
- mission title
- mission type
- duration
- CTA

Rules:
- must be the dominant action on Home
- replaces weak “view progress”-style CTAs
- should feel operational

Status:
REQUIRED

---

## 7.3 RecentSystemActivity

Role:
Small list of recent events.

Content:
- session completed
- return improved
- pain stable
- recovery logged

Rules:
- low visual weight
- used to give system credibility
- not feed-like

Status:
OPTIONAL / RECOMMENDED

---

# 8. Mission Components

## 8.1 MissionHeaderContext

Role:
Render mission metadata.

Content:
- phase
- date
- session status
- optional state info

Rules:
- compact
- technical
- secondary to execution block

Status:
REQUIRED

---

## 8.2 SessionProgressBar

Role:
Show progress across mission blocks.

Content:
- completed blocks count
- total block count
- horizontal progress bar

Rules:
- simple
- technical
- blue progress fill
- calm motion only

Status:
REQUIRED

---

## 8.3 ExecutionTimeline

Role:
Render vertical left-side pipeline for mission blocks.

States:
- pending
- active
- completed

Rules:
- must align perfectly with execution blocks
- no decorative oversized timeline
- must feel structural

Status:
REQUIRED

---

## 8.4 TimelineNode

Role:
Single node in ExecutionTimeline.

States:
- pending
- active
- completed

Rules:
- tiny but legible
- active = blue
- complete = green
- pending = gray

Status:
REQUIRED

---

## 8.5 ExerciseExecutionCard

Role:
Main execution block for each mission step.

Content:
- exercise name
- category
- sets
- reps
- rest
- optional thumbnail/video
- CTA

Rules:
- focus on execution, not media
- avoid giant content-card feeling
- must feel like an execution module, not a lesson card

Status:
REQUIRED

---

## 8.6 BlockCompletionState

Role:
Intermediate completion UI when a mission block ends.

Content:
- block completed
- next block CTA

Rules:
- concise
- no celebration animation overload
- transition into next block smoothly

Status:
REQUIRED

---

## 8.7 MissionCompletionCard

Role:
End-of-session completion state.

Content:
- mission completed
- system adaptation recorded
- CTA back to Home or next step

Rules:
- calm, premium
- no gamified confetti
- no oversized success theatrics

Status:
REQUIRED

---

# 9. Explore Components

## 9.1 ExploreSearchBar

Role:
Primary entry point for search in Explore.

Content:
- placeholder: Search movement, pain or exercise

Rules:
- this is the main control
- Explore should not depend on heavy filter chips

Status:
REQUIRED

---

## 9.2 FeedCard

Role:
Core content card for Explore feed.

Content:
- video / thumbnail
- title
- category tag
- duration
- optional short description

Types:
- physio
- training
- mobility
- nutrition
- mindset

Rules:
- vertical feed optimized
- premium content-focused layout
- not cluttered with controls

Status:
REQUIRED

---

## 9.3 FeedCategoryTag

Role:
Compact tag for content type.

Examples:
- PHYSIO
- TRAINING
- MOBILITY
- NUTRITION
- MINDSET

Rules:
- lightweight
- subtle
- mono-compatible if desired

Status:
REQUIRED

---

## 9.4 PremiumLockedFeedCard

Role:
Show gated content for Premium / Pro.

Content:
- premium insight
- short reason/value
- upgrade CTA

Rules:
- must stay inside the feed
- no aggressive redirect
- should feel product-smart, not paywall-heavy

Status:
REQUIRED if freemium feed exists

---

## 9.5 ExploreFilterBar

Role:
Optional lightweight secondary filter row.

Rules:
- use only if truly needed
- must remain minimal
- avoid wide chip-heavy layout

Status:
OPTIONAL / PREFER TO AVOID

---

# 10. Progress Components

## 10.1 TimeRangeSwitch

Role:
Switch between 7 days and 30 days.

Rules:
- compact
- product-grade segmented control
- no oversized tabs

Status:
REQUIRED

---

## 10.2 ProgressMetricRow

Role:
Top row of key metrics.

Content examples:
- Avg Pain
- Sessions
- Adherence

Rules:
- typically built from MetricCard
- secondary to chart + insight combination

Status:
REQUIRED

---

## 10.3 PainTrendChart

Role:
Display pain evolution over time.

Rules:
- minimal line chart
- restrained palette
- product-grade chart styling
- no generic default chart look

Status:
REQUIRED

---

## 10.4 ReturnConsistencyChart

Role:
Display adherence / return behavior.

Status:
RECOMMENDED

---

## 10.5 LoadBalanceChart

Role:
Display load evolution or balance.

Status:
RECOMMENDED

---

## 10.6 ProgressInsightBlock

Role:
Explain the data in words.

Examples:
- Pain decreasing
- Return consistency stable
- System strain moderate

Rules:
- concise
- intelligent
- helps the system feel real

Status:
REQUIRED

---

# 11. System Screen Components

## 11.1 SystemIdentityBlock

Role:
Display user/node identity.

Content:
- avatar or placeholder
- node/user name
- plan badge

Rules:
- no social profile feel
- tighter vertical spacing
- institutional tone

Status:
REQUIRED

---

## 11.2 SubscriptionCard

Role:
Display plan status.

Content:
- Trial / Premium / Pro
- remaining time
- CTA to plans

Rules:
- should feel like SaaS product subscription panel
- must be one of the main blocks on System screen

Status:
REQUIRED

---

## 11.3 SystemMetricsRow

Role:
Compact metrics row on System screen.

Content:
- Sessions
- Adherence
- Avg Pain

Status:
REQUIRED

---

## 11.4 SettingsList

Role:
Container for all settings rows.

Rows:
- Personal Data
- Notifications
- Clinical History
- Privacy & Data
- Language

Rules:
- settings should appear as rows, not as oversized cards
- each row should be clickable or stubbed with functional placeholders

Status:
REQUIRED

---

## 11.5 SettingsRow

Role:
Single row item inside SettingsList.

Content:
- icon
- label
- chevron / right action
- optional control

Rules:
- reusable
- do not hand-build each row separately

Status:
REQUIRED

---

## 11.6 LanguageSwitch

Role:
Control language selection.

Rules:
- integrated inside Language row
- minimal
- aligned right

Status:
REQUIRED

---

## 11.7 SystemVersionBlock

Role:
Display system version.

Content:
- MOVE OS v1.0
- optional environment/build note

Rules:
- mono text
- subtle
- bottom of settings section

Status:
REQUIRED

---

## 11.8 SignOutButton

Role:
Logout action.

Rules:
- final action on screen
- restrained risk styling
- not oversized, not dramatic

Status:
REQUIRED

---

# 12. Feedback Components

## 12.1 EmptyState

Role:
Show meaningful zero-data state.

Examples:
- No sessions yet
- Your system will activate after your first mission

Rules:
- no blank screens
- preserve system tone

Status:
REQUIRED

---

## 12.2 InlineSkeleton

Role:
Skeleton state for in-layout loading.

Rules:
- use instead of full-screen loading whenever possible
- preserve AppShell during load
- should feel product-grade

Status:
REQUIRED

---

## 12.3 PremiumOverlay

Role:
Soft-lock premium content.

Rules:
- use blur / overlay / CTA
- avoid full-screen pricing redirect when possible
- keep user inside product context

Status:
REQUIRED if freemium logic exists

---

# 13. Splash / Startup Components

## 13.1 SplashScreen

Role:
Premium startup intro.

Content:
- MOVE OS symbol
- line draw
- node pulse
- wordmark reveal

Rules:
- 1.2s to 1.8s max
- must not worsen startup perception
- premium, technical, minimal

Status:
REQUIRED

---

# 14. Components to Deprecate / Remove

The following patterns must be removed from the codebase if still present:

- manual headers inside page content
- old ProfilePage identity structures
- duplicate loading screens
- page-level full-screen spinners overriding AppShell
- heavy filter chip bars in Explore
- legacy navigation variants
- page-specific card styles that duplicate PrimaryCard/SystemCard/MetricCard
- feed-style Mission layouts
- giant media-first exercise cards
- outdated routes that do not belong to final navigation structure

---

# 15. Component Ownership Rules

## Global shared components
Must live in shared component folders and be reused:
- AppShell
- SystemHeader
- BottomNav
- BrandLockup
- MoveOSSymbol
- PrimaryCard
- SystemCard
- MetricCard
- SettingsRow
- HealthStateBadge
- TimeRangeSwitch
- EmptyState
- InlineSkeleton

## Screen-specific components
May live under feature folders but must still use shared tokens and rules:
- ActiveMissionCard
- ExecutionTimeline
- ExerciseExecutionCard
- FeedCard
- ProgressInsightBlock
- SubscriptionCard

No screen should create its own private version of a shared primitive.

---

# 16. Final Implementation Rules

When building or refactoring MOVE OS:

1. start from design tokens
2. use shared primitives first
3. avoid creating page-specific variants unless truly necessary
4. keep the product shell visible during loading
5. ensure the same brand authority across all five screens
6. preserve the MOVE OS engineered aesthetic
7. prefer fewer, stronger components over many weak ones

---

# 17. Quality Target

The component system must support:
- strong brand consistency
- fast implementation
- low duplication
- premium perceived quality
- long-term scalability

Target:
MOVE OS perceived product quality = 9.8 / 10

---
# END OF DOCUMENT