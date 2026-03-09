# MOVE OS — Production Readiness Review

## Current Status: ADVANCED MVP

MOVE OS is **not** currently production-ready for public scale. It is in an **Advanced MVP / Internal Beta** state.
If traffic is sent today, users will experience a strong core loop, but technical contradictions in routing and data fetching will cause inevitable UX breakage.

---

## What blocks production?

### 1. The UX/Routing Schism (CRITICAL)
Currently, a user can log in and see "Mission" on the `HomePage`, but the `BottomNav` directs them to `/today`. The repository contains two entirely parallel versions of the workout experience (`MissionPage.tsx` doing an inline timeline, and `TodayPage.tsx` doing a grouped block structure that navigates to a separated player). This codebase schizophrenia will cause analytics tracing errors, state mismatch, and extreme confusion. 

### 2. Missing Pre-Session Check-in (HIGH)
The `useAdaptiveEngine` relies on a fallback `avg_pain_7d` calculation to estimate current pain and stiffness. A true adaptive protocol *requires* the user to input their exact Pain and Readiness **at the moment** of starting the session. Without this, the engine is hallucinating readiness.

### 3. Hardcoded Explore Data (HIGH)
The `ExplorePage.tsx` looks gorgeous but is fed by a local `/data/exploreData.ts` file. The Supabase `content_assets` table is completely empty (0 rows). If you launch to production, you cannot dynamically update content without deploying a new Vercel build.

### 4. Vercel SPA Routing Vulnerability (MEDIUM)
While a `vercel.json` SPA rewrite was verified for onboarding, it must be robustly tested against deeply nested dynamic routes (e.g., `/explore/routine/123` or `/session/play`) to ensure heavy refreshes do not intermittently drop state if `react-router` isn't universally hydrated properly.

---

## Production QA Checklist (Must-Pass before Launch)

- [ ] **Auth Flow:** Registration → Onboarding → Paywall (Optional) → Dashboard completes with 0 console errors.
- [ ] **Engine Hydration:** `get_home_snapshot` correctly computes metrics for an account with *zero* history without throwing NaN errors.
- [ ] **Execution Safety:** Ensure the Engine's `safetyBlocked` flag completely disables the "Start Session" CTA on production.
- [ ] **Player State:** Suspending the app mid-session (locking the phone) inside `ExercisePlayerPage.tsx` does not reset the entire session tier upon unlock.
- [ ] **Database RLS:** Ensure all 21 Supabase tables have strict Row Level Security (RLS) policies confirming `auth.uid() = user_id`.
- [ ] **Web Vitals:** The bundled JS must drop below the current size (nuking the duplicate pages will instantly secure this).

---

## Readiness Scores
1. **Visual & UI Polish:** 9.5 / 10
2. **Client-Side Engine:** 8.5 / 10
3. **Database Architecture:** 8.0 / 10
4. **Codebase Cleanliness:** 4.0 / 10 *(The primary bottleneck)*

Once the repo cleanup is executed, MOVE OS will instantly transition into a Production-Ready state.
