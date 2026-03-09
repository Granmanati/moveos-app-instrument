# MOVE OS — Roadmap V2 (Path to 9.8/10)

This roadmap describes the exact, strict, step-by-step actions required to resolve the architecture schism, eliminate technical debt, complete the clinical telemetry loop, and achieve true production readiness (a 9.8/10 score).

---

## Phase 1: The Great Cleanup (Week 1)
**Goal: Eliminate the parallel reality and enforce a single source of truth for routing and execution.**

1. **Delete Dead Paths:** 
   - `rm src/pages/MissionPage.tsx`
   - `rm src/pages/ExerciseExecutionPage.tsx`
   - *Rationale:* These are legacy implementations that have been fully superseded by `TodayPage` and `ExercisePlayerPage`.
2. **Rename the Survivors:**
   - Rename `src/pages/TodayPage.tsx` to `src/pages/MissionPage.tsx`.
   - Rename `src/pages/ExercisePlayerPage.tsx` to `src/pages/SessionPlayerPage.tsx`.
3. **Consolidate `ProfilePage`:**
   - Rename `src/pages/ProfilePage.tsx` to `src/pages/SystemPage.tsx`.
4. **Hardcode the Nav:**
   - Update `BottomNav.tsx` to explicitly point to:
     - Home: `/`
     - Mission (Dynamic Action): `/mission`
     - Explore: `/explore`
     - Progress: `/progress`
     - System: `/system`
5. **Update Router:**
   - Update `App.tsx` routes to exactly match the 5 core paths, replacing all standard `react-router-dom` imports with the renamed files. Remove all unused CSS modules.

---

## Phase 2: Closing the Telemetry Loop (Week 2)
**Goal: Ensure the Adaptive Protocol Engine is not hallucinating readiness data.**

1. **Implement Pre-Session Check-in:**
   - Before allowing the user to click "Start Session" on the new `MissionPage`, show a tiny sheet asking: "Current Pain (0-10)?" and "Readiness (1-10)?".
2. **Dynamic Engine Hydration:**
   - Update `useAdaptiveEngine.ts` to receive this real-time pain/readiness data instead of relying solely on the fallback `avg_pain_7d` database calculation.
3. **Save Post-Session Metrics:**
   - Ensure the feedback modal at the end of the execution (`SessionPlayerPage`) successfully writes the exit pain and perceived exertion to `session_exercise_logs` or `training_sessions` so the Progress charts reflect session-specific responses, not just daily averages.

---

## Phase 3: Content Dynamicization (Week 3)
**Goal: Make the platform capable of scaling content without engineering deployments.**

1. **Populate `content_assets` Table:**
   - Take the hardcoded mocks from `/data/exploreData.ts` and write a Supabase migration to insert them natively into the `public.content_assets` table.
2. **Wire ExplorePage to Supabase:**
   - Refactor `ExplorePage.tsx` to run a `safeSelect` against `content_assets` instead of importing local mocks. 
   - Retain the client-side premium gating (`tier === 'free'` checks).
3. **Media CDN Verification:**
   - Ensure all `media_video_url` and thumbnail data point to compressed Supabase Storage buckets or a fast CDN, not Unsplash placeholder URLs.

---

## Phase 4: Bulletproofing & Polish (Week 4)
**Goal: Zero errors, flawless UX under edge cases, and Vercel stability.**

1. **Global Error Boundaries:**
   - Wrap the main `<App />` and `<AppShell />` in a React ErrorBoundary to catch and handle deep engine calculation errors gracefully without crashing the DOM.
2. **Vercel SPA Stability:**
   - Test Vercel rewrites heavily. Refreshing `/explore/routine/123` must immediately re-hydrate without flashing a 404 or logging the user out.
3. **Bundle Optimization:**
   - Run Vite build analysis. Drop any unused libraries (e.g., legacy animation packages if Framer Motion is the primary, or unused date-fns if native Date is used).
4. **Database RLS Audit:**
   - Do a final pass over Supabase to ensure `auth.uid() = user_id` on every user-facing table (`training_sessions`, `evaluations`, `pain_trends`).

---
**Verdict upon completion of Phase 4:** The product will be a mathematically secure, visually stunning, fully adaptive operating system for movement. Score: 9.8/10.
