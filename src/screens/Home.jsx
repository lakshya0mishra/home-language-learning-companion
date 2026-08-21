import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getLanguage } from '../data/languages';
import Header from '../components/Header';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { grade, schoolLanguage, homeLanguage, savedTopics } = useApp();
  const schoolLang = getLanguage(schoolLanguage);
  const homeLang = getLanguage(homeLanguage);

  return (
    <div className="screen screen-with-header home-screen">
      <Header />

      {/* Greeting */}
      <div className="home-greeting">
        <h2 className="home-greeting-text">
          Welcome back! 👋
        </h2>
        <p className="home-greeting-sub">
          Let's learn something wonderful today ✨
        </p>
      </div>

      {/* Language info bar */}
      <div className="home-lang-bar">
        <div className="home-lang-item home-lang-school">
          <span className="home-lang-flag">{schoolLang?.flag}</span>
          <div>
            <span className="home-lang-label">School</span>
            <span className="home-lang-name">{schoolLang?.label}</span>
          </div>
        </div>
        <div className="home-lang-arrow">⇄</div>
        <div className="home-lang-item home-lang-home">
          <span className="home-lang-flag">{homeLang?.flag}</span>
          <div>
            <span className="home-lang-label">Home</span>
            <span className="home-lang-name">{homeLang?.label}</span>
          </div>
        </div>
      </div>

      {/* Primary CTA: Scan */}
      <button 
        className="home-card-scan"
        onClick={() => navigate('/scan')}
        aria-label="Scan a textbook page"
      >
        <div className="home-card-scan-icon">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="4" width="12" height="12" rx="2" stroke="white" strokeWidth="3" fill="none"/>
            <rect x="32" y="4" width="12" height="12" rx="2" stroke="white" strokeWidth="3" fill="none"/>
            <rect x="4" y="32" width="12" height="12" rx="2" stroke="white" strokeWidth="3" fill="none"/>
            <circle cx="38" cy="38" r="6" stroke="white" strokeWidth="3" fill="none"/>
            <line x1="24" y1="10" x2="28" y2="10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <line x1="10" y1="24" x2="10" y2="28" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="home-card-scan-text">
          <span className="home-card-scan-title">📷 Scan Textbook Page</span>
          <span className="home-card-scan-desc">
            Point your camera at a textbook page to find content in both languages
          </span>
        </div>
        <svg className="home-card-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Voice Translate CTA */}
      <button 
        className="home-card-voice"
        onClick={() => navigate('/voice-translate')}
        aria-label="Voice translate between languages"
      >
        <div className="home-card-voice-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" fill="white"/>
            <path d="M19 10v2a7 7 0 01-14 0v-2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="23" x2="16" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="home-card-voice-text">
          <span className="home-card-voice-title">🎙️ Voice Translate</span>
          <span className="home-card-voice-desc">
            Speak in one language and hear the translation instantly
          </span>
        </div>
        <svg className="home-card-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Secondary cards */}
      <div className="home-cards-row">
        <button 
          className="home-card-secondary"
          onClick={() => navigate('/browse')}
          aria-label="Browse by grade and topic"
        >
          <div className="home-card-sec-icon">📚</div>
          <span className="home-card-sec-title">Browse Topics</span>
          <span className="home-card-sec-desc">By grade & subject</span>
        </button>

        <button 
          className="home-card-secondary"
          onClick={() => navigate('/downloads')}
          aria-label="My downloads and offline content"
        >
          <div className="home-card-sec-icon">⬇️</div>
          <span className="home-card-sec-title">My Downloads</span>
          <span className="home-card-sec-desc">
            {savedTopics.length > 0 ? `${savedTopics.length} saved` : 'Offline content'}
          </span>
          {savedTopics.length > 0 && (
            <span className="home-card-count-badge">{savedTopics.length}</span>
          )}
        </button>
      </div>

      {/* Quick tip */}
      <div className="home-tip">
        <span className="home-tip-icon">💡</span>
        <p className="home-tip-text">
          <strong>Tip:</strong> Save topics for offline access so you can learn anytime, even without internet!
        </p>
      </div>
    </div>
  );
}
