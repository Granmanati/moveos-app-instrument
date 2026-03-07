import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import MissionPage from './pages/MissionPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ExplorePage from './pages/ExplorePage';
import PricingPage from './pages/PricingPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { SplashScreen } from './components/SplashScreen';
import { useState } from 'react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="app-wrapper">
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div className="app-container">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Route */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                {/* Onboarding: full-screen, no bottom nav */}
                <Route path="/onboarding" element={<OnboardingPage />} />

                {/* Main app routes with BottomNav */}
                <Route path="/">
                  <Route index element={<HomePage />} />
                  <Route path="mission" element={<MissionPage />} />
                  <Route path="explore" element={<ExplorePage />} />
                  <Route path="progress" element={<ProgressPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="pricing" element={<PricingPage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </div>
    </div>
  );
}
