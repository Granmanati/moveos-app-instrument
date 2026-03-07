# MOVE OS — Refactor & Stabilization Plan
Version: 1.0
Target Quality: 9.8 / 10
Status: Implementation Roadmap

This document defines the required refactor actions to stabilize the MOVE OS codebase.

The objective is to transform the current AI-generated structure into a **clean, scalable product architecture**.

---

# 1. Refactor Objectives

MOVE OS must achieve:

• fast load time  
• consistent UI structure  
• reusable components  
• predictable routing  
• clean separation between UI and logic  

Current problems detected:

• duplicated headers  
• inconsistent layouts  
• orphan pages  
• sequential API calls blocking UI  
• oversized loading states  

---

# 2. Target Architecture

Final project structure:


src/

components/
SystemHeader
BottomNav
SystemCard
MetricCard
ExerciseCard
Timeline

layout/
AppShell

pages/
HomePage
MissionPage
ExplorePage
ProgressPage
SystemPage

context/
AuthContext
SystemContext

services/
supabaseClient
systemEngine

hooks/
useSession
useProgress
useMission

styles/
tokens.css


This structure eliminates duplicated logic and enforces modular design.

---

# 3. Critical Refactor Phase 1
### Routing Cleanup

Target routes must be:


/
Home

/mission
MissionPage

/explore
ExplorePage

/progress
ProgressPage

/system
SystemPage


Actions:

• remove old `/profile` route  
• remove duplicate Explore routes  
• ensure BottomNav matches routing  

---

# 4. Header Standardization

Problem:

Multiple pages define their own headers.

Solution:

All pages must use:

<SystemHeader /> ```

Pages must pass header configuration through props.

Example:

<AppShell
  title="MISSION"
  subtitle="Execute adaptation protocol"
>

No page should manually implement headers.

5. Layout Normalization

Current problem:

Some pages inject content directly outside layout rules.

Solution:

All pages must follow:

<AppShell>
   PageContent
</AppShell>

AppShell responsibilities:

• header rendering
• spacing control
• bottom navigation

Pages only define content blocks.

6. Loading Optimization

Current problem:

Sequential network calls.

Example waterfall:

getSession

refreshSubscription

fetchProfile

Solution:

Parallel loading.

Example pattern:

Promise.all([
  getSession(),
  fetchProfile(),
])

UI must render immediately using skeleton components.

Never block UI.

7. Skeleton UI

Replace full-screen loaders with skeleton blocks.

Examples:

Home:

SystemCardSkeleton
MetricCardSkeleton

Mission:

ExerciseCardSkeleton
TimelineSkeleton

Progress:

ChartSkeleton

This ensures perceived performance < 100ms.

8. Mission Refactor

Mission currently behaves partially like a feed.

Target structure:

SessionContext
SessionProgress
ExecutionTimeline
ExerciseBlocks
CompletionState

Remove:

• large video dominance
• unstructured lists

Mission must behave like an execution pipeline.

9. Explore Refactor

Explore remains part of navigation.

But it must follow feed rules.

Structure:

VideoFeed
ContentCard
EducationalSnippet
ExerciseTechnique

Feed must support:

• infinite scroll
• premium gating
• content tagging

10. Progress Refactor

Progress must only show system metrics.

Allowed metrics:

• Return Consistency
• Session Volume
• Pain Trend
• Load Balance

Remove:

• social-style statistics
• irrelevant charts

11. System Screen Migration

Profile page must be fully replaced.

New page:

SystemPage

Blocks:

Identity
Subscription
SystemMetrics
Settings
Version
SignOut

Rename all references from Profile → System.

12. Bottom Navigation

Final navigation order:

Home
Mission
Explore
Progress
System

Rules:

• icons 24px
• label optional
• active tab = blue

13. Icon System Implementation

Icons must come from a single library.

Recommended:

Lucide Icons

Stroke width:

1.5

Size:

24px

No filled icons.

14. Motion Implementation

Motion must follow MOVE OS motion rules.

Durations:

120ms
200ms
400ms

Examples:

• timeline activation
• card transitions
• progress bar updates

Avoid:

• bounce
• elastic motion

15. Performance Targets

MOVE OS must achieve:

First paint < 500ms
UI visible < 100ms
Route transitions < 200ms

Techniques:

• lazy load pages
• parallel API calls
• skeleton UI

16. Branding Consistency

MOVE OS logo must appear in:

• header
• splash screen
• onboarding

Structure:

symbol + MOVE OS wordmark
17. Splash Screen

Add startup animation.

Structure:

MOVE OS symbol
fade in
line animation
transition to Home

Duration:

1.2s
18. Final Quality Checklist

Before release verify:

• headers consistent
• routing clean
• no duplicate pages
• no full-screen loaders
• spacing consistent
• skeleton states implemented

End of Refactor Plan