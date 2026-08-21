import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    const result = await signInWithGoogle();

    if (result.success) {
      // Navigation will happen automatically via auth state change + routing
      // But we can nudge it along
      navigate('/');
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="login-screen">
      {/* Background decoration */}
      <div className="login-bg">
        <div className="login-circle login-circle-1" />
        <div className="login-circle login-circle-2" />
        <div className="login-circle login-circle-3" />
      </div>

      <div className="login-content">
        {/* Logo & branding */}
        <div className="login-brand">
          <div className="login-logo-ring">
            <span className="login-logo-emoji">📚</span>
            <span className="login-logo-float login-float-1">🌟</span>
            <span className="login-logo-float login-float-2">✏️</span>
            <span className="login-logo-float login-float-3">🌈</span>
          </div>
          <h1 className="login-app-name">HomeLanguage</h1>
          <p className="login-tagline">Learning Companion</p>
        </div>

        {/* Sign-in card */}
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Welcome!</h2>
            <p className="login-card-subtitle">Sign in to start learning together</p>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            className={`login-google-btn ${isLoading ? 'login-google-btn-loading' : ''}`}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            id="google-sign-in-btn"
          >
            {isLoading ? (
              <div className="login-spinner" />
            ) : (
              <>
                <svg className="login-google-icon" width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {/* Info text */}
          <p className="login-info-text">
            🔒 We only use your Google account to identify you. Your data is stored securely.
          </p>
        </div>

        {/* Bottom tagline */}
        <p className="login-demo-hint">
          📖 Learn together in your language — powered by Firebase
        </p>
      </div>
    </div>
  );
}
