import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getTopicById } from '../data/content';
import { getLanguage } from '../data/languages';
import { getSubject } from '../data/grades';
import { recordTopicStudied } from '../services/firestoreService';
import AudioPlayer from '../components/AudioPlayer';
import Header from '../components/Header';
import './BilingualContent.css';

export default function BilingualContent() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { schoolLanguage, homeLanguage, saveTopic, removeTopic, isTopicSaved, savedTopics } = useApp();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('both'); // both | school | home
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const studyRecorded = useRef(false);

  // Try to load from content data or from saved topics
  const topic = useMemo(() => {
    return getTopicById(topicId) || savedTopics.find(t => t.topic_id === topicId);
  }, [topicId, savedTopics]);

  // Record this topic as studied in Firestore
  useEffect(() => {
    if (topic && user && !studyRecorded.current) {
      studyRecorded.current = true;
      recordTopicStudied(user.uid, topic).catch(err =>
        console.error('Failed to record study history:', err)
      );
    }
  }, [topic, user]);

  const schoolLang = getLanguage(schoolLanguage);
  const homeLang = getLanguage(homeLanguage);
  const subjectInfo = topic ? getSubject(topic.subject) : null;
  const isSaved = isTopicSaved(topicId);

  if (!topic) {
    return (
      <div className="screen screen-with-header">
        <Header title="Content" showBack />
        <div className="content-not-found">
          <span className="content-not-found-emoji">😕</span>
          <h2>Topic Not Found</h2>
          <p>We couldn't find this topic. It may have been removed.</p>
          <button className="btn btn-primary btn-lg mt-lg" onClick={() => navigate('/browse')}>
            📚 Browse Topics
          </button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (isSaved) {
      removeTopic(topicId);
    } else {
      saveTopic(topic);
      setShowSaveAnimation(true);
      setTimeout(() => setShowSaveAnimation(false), 2000);
    }
  };

  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i} />;

      // Headings (lines that are short and don't end with common punctuation)
      if (trimmed.length < 60 && !trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.match(/[.!?:।]$/) && i < 3) {
        return <h3 key={i} className="content-heading">{trimmed}</h3>;
      }

      // Bullet points
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        const bulletText = trimmed.replace(/^[•\-]\s*/, '');
        // Bold the part before a dash or colon
        const dashIndex = bulletText.indexOf('—');
        const colonIndex = bulletText.indexOf(':');
        const splitIndex = dashIndex > 0 ? dashIndex : colonIndex > 0 ? colonIndex : -1;

        if (splitIndex > 0) {
          return (
            <div key={i} className="content-bullet">
              <span className="content-bullet-dot">•</span>
              <span>
                <strong>{bulletText.slice(0, splitIndex)}</strong>
                {bulletText.slice(splitIndex)}
              </span>
            </div>
          );
        }
        return (
          <div key={i} className="content-bullet">
            <span className="content-bullet-dot">•</span>
            <span>{bulletText}</span>
          </div>
        );
      }

      // Numbered items
      if (trimmed.match(/^\d+\.\s/)) {
        const numText = trimmed.replace(/^\d+\.\s*/, '');
        const num = trimmed.match(/^\d+/)[0];
        // Bold the part before a colon
        const colonIdx = numText.indexOf(':');
        if (colonIdx > 0) {
          return (
            <div key={i} className="content-numbered">
              <span className="content-number">{num}.</span>
              <span>
                <strong>{numText.slice(0, colonIdx)}</strong>
                {numText.slice(colonIdx)}
              </span>
            </div>
          );
        }
        return (
          <div key={i} className="content-numbered">
            <span className="content-number">{num}.</span>
            <span>{numText}</span>
          </div>
        );
      }

      // Section titles (short lines ending with colon)
      if (trimmed.endsWith(':') && trimmed.length < 60) {
        return <h4 key={i} className="content-section-title">{trimmed}</h4>;
      }

      // Regular paragraph
      return <p key={i} className="content-paragraph">{trimmed}</p>;
    });
  };

  return (
    <div className="screen screen-with-header bilingual-screen">
      <Header title={topic.title_school} showBack />

      {/* Topic header */}
      <div className="bilingual-topic-header">
        <div className="bilingual-topic-icon">{topic.image_emoji}</div>
        <div className="bilingual-topic-info">
          <h2 className="bilingual-topic-title">{topic.title_school}</h2>
          <p className="bilingual-topic-title-home">{topic.title_home}</p>
          <div className="bilingual-topic-meta">
            <span className="badge badge-grade">Grade {topic.grade}</span>
            {subjectInfo && (
              <span className="badge" style={{ background: '#F0E8E0', color: '#6B5B4A' }}>
                {subjectInfo.icon} {subjectInfo.label}
              </span>
            )}
            <span className="text-small text-muted">p. {topic.page_numbers.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Vocabulary bar */}
      {topic.key_vocabulary && (
        <div className="bilingual-vocab">
          <h4 className="bilingual-vocab-title">📝 Key Words</h4>
          <div className="bilingual-vocab-list">
            {topic.key_vocabulary.map((v, i) => (
              <div key={i} className="bilingual-vocab-item">
                <span className="vocab-school">{v.school}</span>
                <span className="vocab-arrow">→</span>
                <span className="vocab-home">{v.home}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View mode tabs (mobile) */}
      <div className="bilingual-tabs" role="tablist">
        <button
          className={`bilingual-tab ${viewMode === 'both' ? 'active' : ''}`}
          onClick={() => setViewMode('both')}
          role="tab"
          aria-selected={viewMode === 'both'}
        >
          Both
        </button>
        <button
          className={`bilingual-tab tab-school ${viewMode === 'school' ? 'active' : ''}`}
          onClick={() => setViewMode('school')}
          role="tab"
          aria-selected={viewMode === 'school'}
        >
          {schoolLang?.flag} School
        </button>
        <button
          className={`bilingual-tab tab-home ${viewMode === 'home' ? 'active' : ''}`}
          onClick={() => setViewMode('home')}
          role="tab"
          aria-selected={viewMode === 'home'}
        >
          {homeLang?.flag} Home
        </button>
      </div>

      {/* Content area */}
      <div className={`bilingual-content-area mode-${viewMode}`}>
        {/* School language column */}
        {(viewMode === 'both' || viewMode === 'school') && (
          <div className="bilingual-column bilingual-column-school" role="region" aria-label="School language content">
            <div className="bilingual-column-header bilingual-column-header-school">
              <span className="bilingual-column-flag">{schoolLang?.flag}</span>
              <span className="bilingual-column-name">{schoolLang?.label}</span>
              <span className="bilingual-column-badge">School</span>
            </div>
            <AudioPlayer
              text={topic.content_school}
              lang={schoolLang?.bcp47 || 'en-US'}
              label={`Listen in ${schoolLang?.label}`}
              colorClass="school"
            />
            <div className="bilingual-column-body">
              {renderContent(topic.content_school)}
            </div>
          </div>
        )}

        {/* Home language column */}
        {(viewMode === 'both' || viewMode === 'home') && (
          <div className="bilingual-column bilingual-column-home" role="region" aria-label="Home language content">
            <div className="bilingual-column-header bilingual-column-header-home">
              <span className="bilingual-column-flag">{homeLang?.flag}</span>
              <span className="bilingual-column-name">{homeLang?.label}</span>
              <span className="bilingual-column-badge">Home</span>
            </div>
            <AudioPlayer
              text={topic.content_home}
              lang={homeLang?.bcp47 || 'hi-IN'}
              label={`Listen in ${homeLang?.label}`}
              colorClass="home"
            />
            <div className="bilingual-column-body">
              {renderContent(topic.content_home)}
            </div>
          </div>
        )}
      </div>

      {/* Save for offline button */}
      <div className="bilingual-save-bar">
        <button
          className={`btn btn-lg btn-full ${isSaved ? 'btn-success' : 'btn-secondary'}`}
          onClick={handleSave}
        >
          {isSaved ? '✅ Saved for Offline' : '⬇️ Save for Offline'}
        </button>
      </div>

      {/* Save animation overlay */}
      {showSaveAnimation && (
        <div className="save-celebration" aria-hidden="true">
          <div className="save-celebration-content">
            <span className="save-star s1">⭐</span>
            <span className="save-star s2">✨</span>
            <span className="save-star s3">🌟</span>
            <span className="save-star s4">⭐</span>
            <span className="save-star s5">✨</span>
            <span className="save-check">✅</span>
            <p className="save-message">Saved!</p>
          </div>
        </div>
      )}
    </div>
  );
}
