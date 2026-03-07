# MOVE OS Technical & UI Rescue Audit
Date: 2026-03-07
Target Quality: 9.8 / 10

## 1. Performance Bottlenecks & Loading States
**Issue:** App takes too long to load on first open, with loading states appearing for too long.
**Causes Identified:**
*   **Sequential Network Waterfalls in `AuthContext`**: On initial load, the app executes three sequential blocking network requests before resolving the `isLoading` state:
    1. `supabase.auth.getSession()`
    2. `supabase.rpc('refresh_subscription_state')`
    3. `supabase.from('user_profile').select('*')`
    This causes a significant delay before the primary UI can even begin rendering.
*   **Redundant Loading Spinners**: `ProtectedRoute.tsx` renders a hardcoded full-screen loading spinner (using `autorenew`) twice; once for `isLoading` and again for `!profile`. This doubles the perceived loading time and prevents any skeleton UI or cached data from showing.
*   **Page-Level Waterfalls**: `HomePage.tsx` and `ProgressPage.tsx` both utilize their own full-page loading completely overriding the AppShell layout. This creates a jarring transition from the Auth loading spinner to a secondary Page loading spinner.

## 2. Branding & Design System Inconsistencies
**Issue:** Branding/header is inconsistent, and screens aren't using the latest design system.
**Causes Identified:**
*   **Inconsistent Header Lockup**: The `moveos-product-design-master.md` strict rule for the institutional `SystemHeader` lockup (System Symbol + MOVE OS wordmark + SYSTEM ACTIVE) is not being universally applied.
    *   `HomePage.tsx` correctly passes `customHeader={<SystemHeader />}`.
    *   `ProfilePage.tsx` manually reconstructs a custom header, ignoring the `SystemHeader` primitive.
    *   `ProgressPage.tsx` and `ExplorePage.tsx` build their own local headers inside the layout instead of passing the lockup.
*   **Missing System / Profile Migration**: The spec mandates that the traditional "Profile" screen be converted to a "System Screen". Currently, `ProfilePage.tsx` retains its consumer-social conceptual naming, routing (`/profile`), and some internal visual structure, despite the `BottomNav` correctly labeling the tab as "System". 
*   **Layout Component Duplication**: `AppShell` handles titles, subtitles, and custom headers, but individual pages (like Progress and Explore) are bypassing this and injecting their own `<header>` elements inside the `children` block, leading to margin/padding inconsistencies.

## 3. Structural & Routing Observations
**Issue:** Old navigation structure is still present, and potential duplicated logic.
**Causes Identified:**
*   **BottomNav Routing**: While `BottomNav` was fixed to 4 tabs visually (`/`, `/today`, `/progress`, `/profile`), `App.tsx` still actively routes `/explore` and `ExplorePage.tsx` is completely preserved in the background. The Explore screen logic is currently orphaned from primary navigation but still loads dynamically if the URL is accessed. 
*   **Auth Gates**: Trial logic and paywall gating are heavily intertwined inside `ProtectedRoute` and `AuthContext`. If `tier === 'free'`, it forces a redirect to `/pricing`, but this interrupts the user flow aggressively rather than utilizing the design system's mandated "Premium Gate" overlays (e.g., blurring Premium execution blocks instead of locking the entire app).

## 4. Recommended Rescue Actions
1. **Refactor AuthContext**: Parallelize the `getSession` and `fetchProfile` calls or utilize an optimistic caching strategy for the user profile to eliminate the sequential waterfall.
2. **Standardize Loading UI**: Remove the full-screen spinner in `ProtectedRoute`. Allow `AppShell` to render immediately with a global generic skeleton state so the user sees the "MOVE OS" structure in < 100ms.
3. **Delete/Migrate ProfilePage**: Rename `ProfilePage.tsx` to `SystemPage.tsx`, update the route to `/system`, and refactor its header to utilize the `SystemHeader` primitive with a custom sublabel.
4. **Enforce SystemHeader**: Strip the manual `<header>` tags from `ProgressPage`, `ExplorePage`, and `TodayPage` and pass `<SystemHeader />` out through the `AppShell` prop.
5. **Decouple Explore**: Determine if the complete `ExplorePage` should be entirely deprecated/deleted or integrated as a sub-view within `TodayPage` (Execution Engine).
