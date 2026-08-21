import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { languages } from '../data/languages';
import { grades } from '../data/grades';
import { subjects } from '../data/grades';
import './Onboarding.css';

const TOTAL_STEPS = 6;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [schoolLang, setSchoolLang] = useState(null);
  const [homeLang, setHomeLang] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const { completeOnboarding } = useApp();
  const navigate = useNavigate();

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const finish = () => {
    completeOnboarding({
      schoolLanguage: schoolLang,
      homeLanguage: homeLang,
      grade: selectedGrade,
      subjectInterests: selectedSubjects,
    });
    navigate('/home');
  };

  const toggleSubject = (id) => {
    setSelectedSubjects(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return !!schoolLang;
      case 2: return !!homeLang;
      case 3: return !!selectedGrade;
      case 4: return true; // subjects are optional
      case 5: return true;
      default: return false;
    }
  };

  const tutorialSlides = [
    {
      icon: '📷',
      title: 'Scan a Page',
      description: 'Point your camera at any textbook page to find matching content in both languages.',
    },
    {
      icon: '📚',
      title: 'Browse Topics',
      description: 'Choose your grade and subject to explore lessons with bilingual explanations.',
    },
    {
      icon: '🔊',
      title: 'Listen & Learn',
      description: 'Tap play to hear content read aloud in either language — perfect for reading along together.',
    },
  ];

  const [tutorialIndex, setTutorialIndex] = useState(0);

  return (
    <div className="onboarding">
      {/* Background decoration */}
      <div className="onboarding-bg">
        <div className="onboarding-circle circle-1" />
        <div className="onboarding-circle circle-2" />
        <div className="onboarding-circle circle-3" />
      </div>

      <div className="onboarding-content">
        {/* Progress dots */}
        {step > 0 && (
          <div className="progress-dots">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`progress-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
              />
            ))}
          </div>
        )}

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="onboarding-step onboarding-welcome" key="welcome">
            <div className="welcome-illustration">
              <div className="welcome-emoji-ring">
                <span className="welcome-emoji-main">📚</span>
                <span className="welcome-emoji floating-1">🌟</span>
                <span className="welcome-emoji floating-2">🎒</span>
                <span className="welcome-emoji floating-3">✏️</span>
                <span className="welcome-emoji floating-4">🌈</span>
              </div>
            </div>
            <h1 className="welcome-title">HomeLanguage</h1>
            <p className="welcome-subtitle">Learning Companion</p>
            <p className="welcome-tagline">
              Learn together in your language 🌟
            </p>
            <p className="welcome-desc">
              Help your child with schoolwork — even if the textbook is in a different language.
            </p>
            <button className="btn btn-primary btn-lg btn-full mt-xl" onClick={next}>
              Let's Get Started! 🚀
            </button>
          </div>
        )}

        {/* Step 1: School Language */}
        {step === 1 && (
          <div className="onboarding-step" key="school-lang">
            <div className="step-header">
              <span className="step-emoji">🏫</span>
              <h2 className="step-title">School Language</h2>
              <p className="step-desc">What language are the textbooks written in?</p>
            </div>
            <div className="selection-list">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  className={`selection-card ${schoolLang === lang.code ? 'selected' : ''}`}
                  onClick={() => setSchoolLang(lang.code)}
                  aria-pressed={schoolLang === lang.code}
                >
                  <span className="selection-card-icon">{lang.flag}</span>
                  <div className="selection-card-content">
                    <div className="selection-card-title">{lang.name}</div>
                    <div className="selection-card-subtitle">{lang.label}</div>
                  </div>
                  <div className="selection-card-check">
                    {schoolLang === lang.code && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Home Language */}
        {step === 2 && (
          <div className="onboarding-step" key="home-lang">
            <div className="step-header">
              <span className="step-emoji">🏠</span>
              <h2 className="step-title">Home Language</h2>
              <p className="step-desc">What language does your family speak at home?</p>
            </div>
            <div className="selection-list">
              {languages
                .filter(lang => lang.code !== schoolLang)
                .map(lang => (
                  <button
                    key={lang.code}
                    className={`selection-card ${homeLang === lang.code ? 'selected' : ''}`}
                    onClick={() => setHomeLang(lang.code)}
                    aria-pressed={homeLang === lang.code}
                  >
                    <span className="selection-card-icon">{lang.flag}</span>
                    <div className="selection-card-content">
                      <div className="selection-card-title">{lang.name}</div>
                      <div className="selection-card-subtitle">{lang.label}</div>
                    </div>
                    <div className="selection-card-check">
                      {homeLang === lang.code && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Step 3: Grade */}
        {step === 3 && (
          <div className="onboarding-step" key="grade">
            <div className="step-header">
              <span className="step-emoji">🎓</span>
              <h2 className="step-title">Your Child's Grade</h2>
              <p className="step-desc">Which grade is your child in?</p>
            </div>
            <div className="grade-grid">
              {grades.map(g => (
                <button
                  key={g.id}
                  className={`grade-card ${selectedGrade === g.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGrade(g.id)}
                  aria-pressed={selectedGrade === g.id}
                >
                  <span className="grade-card-icon">{g.icon}</span>
                  <span className="grade-card-number">{g.id}</span>
                  <span className="grade-card-label">{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Subject Interests (optional) */}
        {step === 4 && (
          <div className="onboarding-step" key="subjects">
            <div className="step-header">
              <span className="step-emoji">📖</span>
              <h2 className="step-title">Favorite Subjects</h2>
              <p className="step-desc">Which subjects does your child need help with? (Optional)</p>
            </div>
            <div className="selection-list">
              {subjects.map(sub => (
                <button
                  key={sub.id}
                  className={`selection-card ${selectedSubjects.includes(sub.id) ? 'selected' : ''}`}
                  onClick={() => toggleSubject(sub.id)}
                  aria-pressed={selectedSubjects.includes(sub.id)}
                >
                  <span className="selection-card-icon">{sub.icon}</span>
                  <div className="selection-card-content">
                    <div className="selection-card-title">{sub.label}</div>
                  </div>
                  <div className="selection-card-check">
                    {selectedSubjects.includes(sub.id) && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button className="btn btn-ghost btn-full mt-md" onClick={next}>
              Skip for now →
            </button>
          </div>
        )}

        {/* Step 5: Tutorial */}
        {step === 5 && (
          <div className="onboarding-step" key="tutorial">
            <div className="step-header">
              <span className="step-emoji">💡</span>
              <h2 className="step-title">How It Works</h2>
            </div>
            <div className="tutorial-card">
              <div className="tutorial-icon-container">
                <span className="tutorial-icon">{tutorialSlides[tutorialIndex].icon}</span>
              </div>
              <h3 className="tutorial-slide-title">{tutorialSlides[tutorialIndex].title}</h3>
              <p className="tutorial-slide-desc">{tutorialSlides[tutorialIndex].description}</p>
              <div className="progress-dots mt-lg">
                {tutorialSlides.map((_, i) => (
                  <button
                    key={i}
                    className={`progress-dot ${i === tutorialIndex ? 'active' : ''} ${i < tutorialIndex ? 'completed' : ''}`}
                    onClick={() => setTutorialIndex(i)}
                    aria-label={`Tutorial step ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            {tutorialIndex < tutorialSlides.length - 1 ? (
              <button className="btn btn-secondary btn-lg btn-full mt-lg" onClick={() => setTutorialIndex(i => i + 1)}>
                Next Tip →
              </button>
            ) : (
              <button className="btn btn-primary btn-lg btn-full mt-lg" onClick={finish}>
                Start Learning! 🎉
              </button>
            )}
            <button className="btn btn-ghost btn-full mt-sm" onClick={finish}>
              Skip tutorial
            </button>
          </div>
        )}

        {/* Navigation buttons */}
        {step > 0 && step < 5 && (
          <div className="onboarding-nav">
            <button className="btn btn-ghost" onClick={prev}>
              ← Back
            </button>
            {step === 4 ? null : (
              <button
                className="btn btn-primary"
                onClick={next}
                disabled={!canProceed()}
              >
                Continue →
              </button>
            )}
          </div>
        )}
        {step === 4 && (
          <div className="onboarding-nav" style={{ justifyContent: 'space-between' }}>
            <button className="btn btn-ghost" onClick={prev}>
              ← Back
            </button>
            <button className="btn btn-primary" onClick={next}>
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
