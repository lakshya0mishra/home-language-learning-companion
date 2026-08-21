import { useApp } from '../context/AppContext';
import { getLanguage } from '../data/languages';
import { getGrade } from '../data/grades';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header({ title, showBack, onBack }) {
  const { grade, schoolLanguage, homeLanguage, user } = useApp();
  const navigate = useNavigate();
  const schoolLang = getLanguage(schoolLanguage);
  const homeLang = getLanguage(homeLanguage);
  const gradeInfo = getGrade(grade);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <header className="header" role="banner">
      <div className="header-inner">
        <div className="header-left">
          {showBack && (
            <button 
              className="header-back-btn" 
              onClick={handleBack}
              aria-label="Go back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          {title ? (
            <h1 className="header-title">{title}</h1>
          ) : (
            <div className="header-brand">
              <span className="header-logo">📚</span>
              <span className="header-app-name">HomeLanguage</span>
            </div>
          )}
        </div>
        <div className="header-right">
          {gradeInfo && (
            <span className="badge badge-grade" aria-label={`Grade ${grade}`}>
              {gradeInfo.icon} G{grade}
            </span>
          )}
          {schoolLang && (
            <span className="badge badge-school" aria-label={`School language: ${schoolLang.label}`}>
              {schoolLang.flag}
            </span>
          )}
          {homeLang && (
            <span className="badge badge-home" aria-label={`Home language: ${homeLang.label}`}>
              {homeLang.flag}
            </span>
          )}
          <button
            className="header-avatar-btn"
            onClick={() => navigate('/settings')}
            aria-label="Open settings"
          >
            <span className="header-avatar-letter">{userInitial}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
