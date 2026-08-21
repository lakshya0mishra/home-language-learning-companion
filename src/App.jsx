import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import Login from './screens/Login';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import ScanFlow from './screens/ScanFlow';
import Browse from './screens/Browse';
import BilingualContent from './screens/BilingualContent';
import Downloads from './screens/Downloads';
import VoiceTranslate from './screens/VoiceTranslate';
import Settings from './screens/Settings';

// Loading spinner while Firebase auth initializes
function LoadingScreen() {
  return (
    <div className="app-loading">
      <div className="app-loading-content">
        <span className="app-loading-emoji">📚</span>
        <div className="app-loading-spinner" />
        <p className="app-loading-text">Loading...</p>
      </div>
    </div>
  );
}

// Helper: redirect based on auth + onboarding state
function AuthGuard({ children }) {
  const { isLoggedIn } = useAuth();
  const { onboardingComplete, profileLoaded } = useApp();

  if (!profileLoaded) return <LoadingScreen />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;
  return children;
}

function AppRoutes() {
  const { isLoggedIn, loading } = useAuth();
  const { onboardingComplete, profileLoaded } = useApp();

  // Wait for Firebase auth to initialize
  if (loading) return <LoadingScreen />;

  // Where should "/" redirect?
  const rootRedirect = !isLoggedIn
    ? '/login'
    : !profileLoaded
      ? '/login'
      : onboardingComplete
        ? '/home'
        : '/onboarding';

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to={rootRedirect} replace />} />

        {/* Public: Login */}
        <Route
          path="/login"
          element={
            isLoggedIn && profileLoaded
              ? <Navigate to={onboardingComplete ? '/home' : '/onboarding'} replace />
              : <Login />
          }
        />

        {/* Semi-protected: Onboarding (needs login, but not onboarding) */}
        <Route
          path="/onboarding"
          element={
            !isLoggedIn
              ? <Navigate to="/login" replace />
              : onboardingComplete && profileLoaded
                ? <Navigate to="/home" replace />
                : <Onboarding />
          }
        />

        {/* Protected routes */}
        <Route path="/home" element={<AuthGuard><Home /></AuthGuard>} />
        <Route path="/scan" element={<AuthGuard><ScanFlow /></AuthGuard>} />
        <Route path="/browse" element={<AuthGuard><Browse /></AuthGuard>} />
        <Route path="/content/:topicId" element={<AuthGuard><BilingualContent /></AuthGuard>} />
        <Route path="/downloads" element={<AuthGuard><Downloads /></AuthGuard>} />
        <Route path="/voice-translate" element={<AuthGuard><VoiceTranslate /></AuthGuard>} />
        <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
