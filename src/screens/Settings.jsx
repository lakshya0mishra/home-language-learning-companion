import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { languages, getLanguage } from '../data/languages';
import { grades, subjects as allSubjects } from '../data/grades';
import Header from '../components/Header';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const {
    user,
    schoolLanguage,
    homeLanguage,
    grade,
    subjectInterests,
    updateSettings,
    fetchStudyHistory,
    logout,
    resetApp,
    theme,
    toggleTheme,
  } = useApp();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(null); // null | 'school' | 'home'
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [saveFlash, setSaveFlash] = useState('');
  const [studyHistory, setStudyHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadHistory() {
      if (fetchStudyHistory) {
        const history = await fetchStudyHistory();
        if (mounted) {
          setStudyHistory(history);
          setLoadingHistory(false);
        }
      }
    }
    loadHistory();
    return () => { mounted = false; };
  }, [fetchStudyHistory]);

  const schoolLang = getLanguage(schoolLanguage);
  const homeLang = getLanguage(homeLanguage);
  const currentGrade = grades.find(g => g.id === grade);

  const handleLangSelect = (langCode) => {
    if (showLangPicker === 'school') {
      // Don't allow same as home
      if (langCode === homeLanguage) return;
      updateSettings({ schoolLanguage: langCode });
      setSaveFlash('School language updated!');
    } else {
      // Don't allow same as school
      if (langCode === schoolLanguage) return;
      updateSettings({ homeLanguage: langCode });
      setSaveFlash('Home language updated!');
    }
    setShowLangPicker(null);
    setTimeout(() => setSaveFlash(''), 2000);
  };

  const handleGradeSelect = (gradeId) => {
    updateSettings({ grade: gradeId });
    setShowGradePicker(false);
    setSaveFlash('Grade updated!');
    setTimeout(() => setSaveFlash(''), 2000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleReset = async () => {
    await resetApp();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="screen screen-with-header settings-screen">
      <Header title="Settings" showBack />

      {/* Save flash notification */}
      {saveFlash && (
        <div className="settings-flash">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          {saveFlash}
        </div>
      )}

      {/* Profile section */}
      <div className="settings-profile">
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.name || 'Profile'}
            className="settings-avatar settings-avatar-photo"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="settings-avatar">
            <span className="settings-avatar-letter">{userInitial}</span>
          </div>
        )}
        <div className="settings-profile-info">
          <h2 className="settings-profile-name">{user?.name || 'Guest'}</h2>
          <p className="settings-profile-email">{user?.email || ''}</p>
        </div>
      </div>

      {/* Language settings */}
      <div className="settings-section">
        <h3 className="settings-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
          </svg>
          Languages
        </h3>

        <button className="settings-option" onClick={() => setShowLangPicker('school')}>
          <div className="settings-option-left">
            <span className="settings-option-icon">{schoolLang?.flag || '🏫'}</span>
            <div>
              <span className="settings-option-label">School Language</span>
              <span className="settings-option-value">{schoolLang?.label || 'Not set'}</span>
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        <button className="settings-option" onClick={() => setShowLangPicker('home')}>
          <div className="settings-option-left">
            <span className="settings-option-icon">{homeLang?.flag || '🏠'}</span>
            <div>
              <span className="settings-option-label">Home Language</span>
              <span className="settings-option-value">{homeLang?.label || 'Not set'}</span>
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* Grade settings */}
      <div className="settings-section">
        <h3 className="settings-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 10 3 12 0v-5"/>
          </svg>
          Grade
        </h3>

        <button className="settings-option" onClick={() => setShowGradePicker(!showGradePicker)}>
          <div className="settings-option-left">
            <span className="settings-option-icon">{currentGrade?.icon || '🎓'}</span>
            <div>
              <span className="settings-option-label">Child's Grade</span>
              <span className="settings-option-value">{currentGrade?.label || 'Not set'}</span>
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* Display settings */}
      <div className="settings-section">
        <h3 className="settings-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
          Display
        </h3>

        <div className="settings-option" style={{ cursor: 'default' }}>
          <div className="settings-option-left">
            <span className="settings-option-icon">🌙</span>
            <div>
              <span className="settings-option-label">Dark Mode</span>
              <span className="settings-option-value">Toggle dark theme appearance</span>
            </div>
          </div>
          <div 
            className={`downloads-toggle ${theme === 'dark' ? 'active' : ''}`}
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === 'dark'}
            style={{ cursor: 'pointer' }}
          >
            <div className="downloads-toggle-thumb" />
          </div>
        </div>
      </div>

      {/* Subjects & Progress */}
      <div className="settings-section">
        <h3 className="settings-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          Favorite Subjects
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '12px 16px' }}>
          {subjectInterests && subjectInterests.length > 0 ? (
            subjectInterests.map(subId => {
              const subObj = allSubjects.find(s => s.id === subId);
              return (
                <span key={subId} className="badge" style={{ background: '#e8f0fe', color: '#1a73e8', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {subObj?.icon || '📖'} {subObj?.label || subId}
                </span>
              );
            })
          ) : (
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>All Subjects</span>
          )}
        </div>
      </div>

      {/* What they studied till now */}
      <div className="settings-section">
        <h3 className="settings-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          What You Have Studied Till Now ({studyHistory.length})
        </h3>
        <div style={{ padding: '8px 16px' }}>
          {loadingHistory ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Loading study history...</p>
          ) : studyHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {studyHistory.slice(0, 5).map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'var(--color-bg-warm)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <strong>{item.topicTitle || 'Lesson'}</strong>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      {item.subject ? `${item.subject} • ` : ''}Grade {item.grade || grade || '-'}
                    </div>
                  </div>
                  <span style={{ color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {item.studiedAt?.toDate ? item.studiedAt.toDate().toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No topics studied yet. Open any topic to start tracking your progress!</p>
          )}
        </div>
      </div>

      {/* Account actions */}
      <div className="settings-section">
        <h3 className="settings-section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Account
        </h3>

        <button className="settings-option settings-option-logout" onClick={() => setShowLogoutConfirm(true)}>
          <div className="settings-option-left">
            <span className="settings-option-icon">🚪</span>
            <div>
              <span className="settings-option-label settings-option-label-logout">Log Out</span>
              <span className="settings-option-value">Sign out of your account</span>
            </div>
          </div>
        </button>

        <button className="settings-option settings-option-danger" onClick={() => setShowResetConfirm(true)}>
          <div className="settings-option-left">
            <span className="settings-option-icon">⚠️</span>
            <div>
              <span className="settings-option-label settings-option-label-danger">Reset App</span>
              <span className="settings-option-value">Delete all data and start fresh</span>
            </div>
          </div>
        </button>
      </div>

      {/* ── Pickers / Modals ─────────────────────────────────── */}

      {/* Language picker modal */}
      {showLangPicker && (
        <div className="settings-modal-overlay" onClick={() => setShowLangPicker(null)}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3>{showLangPicker === 'school' ? '🏫 School Language' : '🏠 Home Language'}</h3>
              <button className="settings-modal-close" onClick={() => setShowLangPicker(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="settings-modal-body">
              {languages.map(lang => {
                const isDisabled =
                  (showLangPicker === 'school' && lang.code === homeLanguage) ||
                  (showLangPicker === 'home' && lang.code === schoolLanguage);
                const isSelected =
                  (showLangPicker === 'school' && lang.code === schoolLanguage) ||
                  (showLangPicker === 'home' && lang.code === homeLanguage);

                return (
                  <button
                    key={lang.code}
                    className={`selection-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'settings-lang-disabled' : ''}`}
                    onClick={() => !isDisabled && handleLangSelect(lang.code)}
                    disabled={isDisabled}
                  >
                    <span className="selection-card-icon">{lang.flag}</span>
                    <div className="selection-card-content">
                      <div className="selection-card-title">{lang.name}</div>
                      <div className="selection-card-subtitle">
                        {lang.label}
                        {isDisabled && (
                          <span className="settings-lang-conflict">
                            (already {showLangPicker === 'school' ? 'home' : 'school'} language)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="selection-card-check">
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Grade picker modal */}
      {showGradePicker && (
        <div className="settings-modal-overlay" onClick={() => setShowGradePicker(false)}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3>🎓 Select Grade</h3>
              <button className="settings-modal-close" onClick={() => setShowGradePicker(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="settings-modal-body settings-grade-grid">
              {grades.map(g => (
                <button
                  key={g.id}
                  className={`settings-grade-card ${grade === g.id ? 'settings-grade-card-selected' : ''}`}
                  onClick={() => handleGradeSelect(g.id)}
                >
                  <span className="settings-grade-icon">{g.icon}</span>
                  <span className="settings-grade-num">{g.label}</span>
                  <span className="settings-grade-desc">{g.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logout confirmation */}
      {showLogoutConfirm && (
        <div className="settings-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="settings-confirm" onClick={e => e.stopPropagation()}>
            <span className="settings-confirm-icon">🚪</span>
            <h3>Log Out?</h3>
            <p>Your saved topics and settings will be kept for when you log back in.</p>
            <div className="settings-confirm-actions">
              <button className="btn btn-ghost" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset confirmation */}
      {showResetConfirm && (
        <div className="settings-modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="settings-confirm" onClick={e => e.stopPropagation()}>
            <span className="settings-confirm-icon">⚠️</span>
            <h3>Reset Everything?</h3>
            <p>This will delete all your data, saved topics, and account information. This cannot be undone.</p>
            <div className="settings-confirm-actions">
              <button className="btn btn-ghost" onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button className="btn settings-btn-danger" onClick={handleReset}>Reset App</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
