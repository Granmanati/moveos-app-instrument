import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import TodayPage from './pages/TodayPage';
import ExplorePage from './pages/ExplorePage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <div className="app-wrapper">
      <div className="app-container">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Route */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/onboarding" element={<OnboardingPage />} />

                <Route path="/">
                  <Route index element={<HomePage />} />
                  <Route path="today" element={<TodayPage />} />
                  <Route path="explore" element={<ExplorePage />} />
                  <Route path="progress" element={<ProgressPage />} />
                  <Route path="profile" element={<ProfilePage />} />
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
